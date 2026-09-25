from fastapi import FastAPI
from pydantic import BaseModel
app=FastAPI()

class userCreate(BaseModel):
    username: str
    password: str
fake_users_db = {}
@app.post("/signup")
async def signup(user:userCreate):

    if user.username in fake_users_db:
        return{"already exists"}
    
    fake_users_db[user.username]={
        "username": user.username,
        "password": user.password
    }
    return{"message": "User created successfully"}
@app.post("/login")
async def login(user: userCreate):

    db_user = fake_users_db.get(user.username)

    if not db_user:
        return {"message": "Invalid credentials"}

    if db_user["password"] != user.password:
        return {"message": "Invalid credentials"}

    return {
    "access_token": "some_token"
}