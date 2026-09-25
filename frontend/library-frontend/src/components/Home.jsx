import book from "../assets/book.png";

function Home({ onEnter }) {
  return (
    <section className="home">
      <div className="home-copy">
        <h1>Welcome to Bookstore</h1>
        <p className="muted">
          Browse the collection, borrow what you like, and return it when you're done.
        </p>
        <button className="btn btn-primary" onClick={onEnter}>
          View books
        </button>
      </div>
      <img className="home-img" src={book} alt="A shelf of library books" />
    </section>
  );
}

export default Home;
