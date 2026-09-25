from pydantic import BaseModel

class User(BaseModel):
    username: str
    password: str
    role: str = "user"

class Book(BaseModel):
    title: str
    author: str
    quantity: int


class TaskCreate(BaseModel):
    title: str