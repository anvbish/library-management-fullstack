import { useState } from "react";


function BookForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    author: initial?.author || "",
    quantity: initial?.quantity ?? 1,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({ ...form, quantity: Number(form.quantity) });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form className="form book-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input value={form.title} onChange={update("title")} required />
      </label>
      <label>
        Author
        <input value={form.author} onChange={update("author")} required />
      </label>
      <label>
        Copies available
        <input type="number" min="0" value={form.quantity} onChange={update("quantity")} required />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row">
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : initial ? "Save changes" : "Add book"}
        </button>
        <button type="button" className="btn btn-quiet" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default BookForm;
