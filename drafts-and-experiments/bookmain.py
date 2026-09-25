"""from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

books=[
    {
        "id":1,
        "title":"The Great Gatsby",
        "author":"F. Scott Fitzgerald",
    },
     {
        "id": 2,
        "title": "Atomic Habits",
        "author": "James Clear"
    }
]

class Book(BaseModel):
    id: int
    title: str
    author:str

@app.get("/")
async def home():
    return {"message": "Welcome to Book Store API"}

@app.get("/books")
async def get_books():
    return books

@app.get("/books/{book_id}")
async def get_book(book_id: int):

    for book in books:
        if book["id"] == book_id:
            return book

    raise HTTPException(
        status_code=404,
        detail="Book not found"
    )

@app.post("/books")
async def create_book(book: Book):
    books.append(book.dict())
    return book

@app.put("/books/{book_id}")
async def update_book(book_id: int, book: Book):
    books[book_id-1] = update_book.dict()
    return update_book"""