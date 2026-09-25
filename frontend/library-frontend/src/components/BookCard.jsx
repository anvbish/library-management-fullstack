import { useState } from "react";
import BookForm from "./BookForm";


const SPINES = ["#1f5c4d", "#2f4a7a", "#7a3b3b", "#5b4a8a", "#8a6a1f", "#2e6a75"];
const spineFor = (title = "") =>
  SPINES[[...title].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % SPINES.length];

function BookCard({ book, user, isAdmin, borrowed, onBorrow, onReturn, onUpdate, onDelete, busy }) {
  const [editing, setEditing] = useState(false);
  const outOfStock = book.quantity <= 0;

  if (editing) {
    return (
      <li className="book editing">
        <BookForm
          initial={book}
          onCancel={() => setEditing(false)}
          onSave={async (data) => {
            await onUpdate(data);
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className="book" style={{ "--spine": spineFor(book.title) }}>
      <div className="book-info">
        <h2>{book.title}</h2>
        <p className="author">{book.author}</p>
        <p className={outOfStock ? "stock out" : "stock"}>
          {outOfStock ? "All copies borrowed" : `${book.quantity} ${book.quantity === 1 ? "copy" : "copies"} available`}
          {borrowed && " · You have this book"}
        </p>
      </div>

      <div className="book-actions">
        {user && !borrowed && (
          <button className="btn btn-primary" disabled={outOfStock || busy} onClick={onBorrow}>
            Borrow
          </button>
        )}
        {user && borrowed && (
          <button className="btn btn-primary" disabled={busy} onClick={onReturn}>
            Return
          </button>
        )}
        {isAdmin && (
          <>
            <button className="btn btn-quiet" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button
              className="btn btn-danger"
              disabled={busy}
              onClick={() => window.confirm(`Delete "${book.title}"?`) && onDelete()}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default BookCard;
