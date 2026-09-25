import { useState, useEffect, useCallback } from "react";
import BookCard from "./BookCard";
import BookForm from "./BookForm";
import { api } from "../api";
import { useAuth } from "../AuthContext";

function BookList({ onNeedLogin }) {
  const { user, isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [borrowed, setBorrowed] = useState([]); 
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyTitle, setBusyTitle] = useState(null);

  const loadBooks = useCallback(async () => {
    try {
      setBooks(await api.getBooks());
      setError("");
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Can't reach the server. Is the API running on port 8000?"
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBorrowed = useCallback(async () => {
    if (!user) {
      setBorrowed([]);
      return;
    }
    try {
      const records = await api.myBooks();
      setBorrowed(records.map((r) => r.book));
    } catch {
      setBorrowed([]);
    }
  }, [user]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    loadBorrowed();
  }, [loadBorrowed]);

  
  const run = async (title, action, successMessage) => {
    setBusyTitle(title);
    setNotice("");
    setError("");
    try {
      await action();
      setNotice(successMessage);
      await Promise.all([loadBooks(), loadBorrowed()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyTitle(null);
    }
  };

  const query = search.toLowerCase();
  const filtered = books.filter(
    (b) => b.title?.toLowerCase().includes(query) || b.author?.toLowerCase().includes(query)
  );

  return (
    <section>
      <div className="list-head">
        <div>
          <h1>Books</h1>
          {!user && (
            <p className="muted">
              <button className="link" onClick={onNeedLogin}>Log in</button> to borrow or return a book.
            </p>
          )}
        </div>
        {isAdmin && !adding && (
          <button className="btn btn-primary" onClick={() => setAdding(true)}>
            Add a book
          </button>
        )}
      </div>

      {adding && (
        <div className="panel">
          <BookForm
            onCancel={() => setAdding(false)}
            onSave={async (data) => {
              await api.addBook(data);
              setAdding(false);
              setNotice(`Added "${data.title}".`);
              await loadBooks();
            }}
          />
        </div>
      )}

      <input
        className="search"
        type="search"
        placeholder="Search by title or author"
        aria-label="Search books"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {notice && <p className="notice" role="status">{notice}</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {loading && <p className="muted">Loading books...</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="muted empty">
          {books.length === 0
            ? isAdmin ? "No books yet. Add the first one." : "No books have been added yet."
            : `No books match "${search}".`}
        </p>
      )}

      <ul className="books">
        {filtered.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            user={user}
            isAdmin={isAdmin}
            borrowed={borrowed.includes(book.title)}
            busy={busyTitle === book.title}
            onBorrow={() => run(book.title, () => api.borrowBook(book.title), `Borrowed "${book.title}".`)}
            onReturn={() => run(book.title, () => api.returnBook(book.title), `Returned "${book.title}".`)}
            onUpdate={async (data) => {
              await api.updateBook(book.title, data);
              setNotice(`Saved changes to "${data.title}".`);
              await loadBooks();
            }}
            onDelete={() => run(book.title, () => api.deleteBook(book.title), `Deleted "${book.title}".`)}
          />
        ))}
      </ul>
    </section>
  );
}

export default BookList;
