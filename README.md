# Library Management – Full Stack

A full-stack library management app. Users can browse and search books, and borrow and return them.
Admins can add, edit, and delete books.

## Tech stack
- **Backend:** Python, FastAPI, MongoDB, JWT (access + refresh tokens), bcrypt, Pydantic
- **Frontend:** React (Vite), plain CSS

## Features
- Register / log in with JWT authentication and automatic token refresh
- Role-based access (user vs admin)
- Book list with search by title or author
- Borrow / return books, with stock tracking
- Admin: add, edit, and delete books

## Project structure
```
library-management-fullstack/
├── backend/
│   └── library_app/
│       ├── main.py
│       ├── auth.py
│       ├── db.py
│       └── models.py
├── frontend/
│   └── library-frontend/
├── drafts-and-experiments/   (early scripts kept for reference, not part of the running app)
└── README.md
```

## Run the backend

Requires MongoDB running locally on the default port (`mongodb://localhost:27017`).

```bash
cd backend
pip install fastapi uvicorn pymongo python-jose passlib bcrypt python-dotenv pydantic
```

Create a `.env` file inside `backend/`:
```
SECRET_KEY=your-secret-key-here
```

Run the server from the **repo root** (the imports use `backend.library_app...`):
```bash
uvicorn backend.library_app.main:app --reload
```
API runs at http://127.0.0.1:8000 (interactive docs at `/docs`).

## Run the frontend

```bash
cd frontend/library-frontend
npm install
npm run dev
```
App runs at http://localhost:5173.

## Notes
`drafts-and-experiments/` contains earlier scripts from building this project (auth experiments, an early task-manager idea) — kept for reference, not part of the running app.

## Other projects
I've also built an AI assistant using LangGraph, RAG, and Gemini/Ollama:
- **AVA – Agentic AI Assistant**: https://avaai19.streamlit.app/