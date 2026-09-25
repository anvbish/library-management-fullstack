from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException

from library_app.db import (
    users_collection,
    books_collection,
    borrow_collection
)

from library_app.models import User, Book

from library_app.auth import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    admin_required,
    SECRET_KEY,
    ALGORITHM,
    hash_password,
    verify_password
)

from bson import ObjectId
from jose import jwt, JWTError

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return{"message":"Library API running"}

@app.get("/check-users")
def check_users(user=Depends(admin_required)):
    return list(users_collection.find({}, {"_id": 0, "password": 0}))

@app.get("/books")
def get_books(
    skip: int = 0,
    limit: int = 10
):
    
    books = list(
        books_collection.find()
        .skip(skip)
        .limit(limit)
    )

    for book in books:
        book["_id"] = str(book["_id"])

    return books

@app.get("/books/{book_id}")
def get_book(book_id: str):

    book = books_collection.find_one(
        {"_id": ObjectId(book_id)}
    )

    if not book:
        return {"message": "Book not found"}

    book["_id"] = str(book["_id"])

    return book

@app.get("/profile")
async def profile(
    current_user=Depends(get_current_user)
):
    return current_user

@app.get("/my-books")
def my_books(
    user=Depends(get_current_user)
):

    books = list(
        borrow_collection.find(
            {"username": user["username"]},
            {"_id": 0}
        )
    )

    return books

@app.post('/register')
def register(user:User):

    existing_user = users_collection.find_one(
        {"username": user.username}
    )

    if existing_user:
        return {"message":"User already exists"}

    hashed_password = hash_password(
        user.password
    )

    user_data = user.dict()
    user_data["role"] = "user"

    user_data["password"] = hashed_password

    users_collection.insert_one(user_data)

    return {
        "message":"User registered successfully"
    }


@app.post('/login')
def login(user:User):

    db_user=users_collection.find_one(
        {"username":user.username}
    )

    if not db_user:
        return{"message":"Invalid credentials"}

    if not verify_password(
    user.password,
    db_user["password"]
    ):
        return {"message":"Wrong Password"}

    access_token = create_access_token(
        {
            "sub": user.username,
            "role": db_user.get("role", "user")
        }
    )

    refresh_token = create_refresh_token(
        {
            "sub": user.username
        }
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/books")
def add_book(
    book: Book,
    current_user = Depends(admin_required)
):
    if books_collection.find_one({"title": book.title}):
        raise HTTPException(status_code=400, detail="A book with this title already exists")
    books_collection.insert_one(
        book.dict()
    )

    return {
        "message": "Book added successfully"
    }

@app.post("/borrow/{title}")
def borrow_book(
    title: str,
    user=Depends(get_current_user)
):
    book = books_collection.find_one({"title": title})
    if not book:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )
    existing_borrow = borrow_collection.find_one(
    {
        "username": user["username"],
        "book": title
    }
)

    if existing_borrow:
        raise HTTPException(
        status_code=400,
        detail="You already borrowed this book"
    )
    

    if book["quantity"] <= 0:
        raise HTTPException(
            status_code=400,    
            detail="Book unavailable"
        )

    books_collection.update_one(
        {"title": title},
        {"$inc": {"quantity": -1}}
    )

    borrow_collection.insert_one(
    {
        "username": user["username"],
        "book": title
    }
    )

    return {
        "message": f"{title} borrowed successfully"
    }


@app.post("/return/{title}")
def return_book(
    title: str,
    user=Depends(get_current_user)
):
    book = books_collection.find_one(
        {"title": title}
    )

    if not book:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    borrow_record = borrow_collection.find_one(
        {
            "username": user["username"],
            "book": title
        }
    )

    if not borrow_record:
        raise HTTPException(
            status_code=400,
            detail="You have not borrowed this book"
        )

    borrow_collection.delete_one(
        {
            "username": user["username"],
            "book": title
        }
    )

    books_collection.update_one(
        {"title": title},
        {"$inc": {"quantity": 1}}
    )

    return {
        "message": f"{title} returned successfully"
    }


@app.delete("/books/{title}")
def delete_book(
    title: str,
    user=Depends(get_current_user)
):
    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admins only"
        )

    result = books_collection.delete_one(
        {"title": title}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    return {"message": "Book deleted"}

@app.post("/refresh")
def refresh_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
 
        db_user = users_collection.find_one({"username": username})
        if not db_user:
            raise HTTPException(status_code=401, detail="User not found")
 
        access_token = create_access_token(
            {"sub": username, "role": db_user.get("role", "user")}
        )
        return {"access_token": access_token}
 
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
@app.put("/books/{title}")
def update_book(
    title: str,
    book: Book,
    user=Depends(admin_required)
):
    
    result = books_collection.update_one(
        {"title": title},
        {
            "$set": {
                "title": book.title,
                "author": book.author,
                "quantity": book.quantity
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    return {
        "message": "Book updated successfully"
    }

@app.get("/books/search")
def search_books(title: str):

    books = list(
        books_collection.find(
            {
                "title": {
                    "$regex": title,
                    "$options": "i"
                }
            }
        )
    )

    for book in books:
        book["_id"] = str(book["_id"])

    return books

