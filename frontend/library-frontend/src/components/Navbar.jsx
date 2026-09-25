import { useAuth } from "../AuthContext";

function Navbar({ onNavigate }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="navbar">
      <button className="brand" onClick={() => onNavigate("home")}>
        Bookstore
      </button>
      <nav className="nav-actions">
        <button className="btn btn-quiet" onClick={() => onNavigate("books")}>
          Books
        </button>
        {user ? (
          <>
            <span className="who">
              {user.username}
              {isAdmin && <span className="badge">Admin</span>}
            </span>
            <button className="btn btn-quiet" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-quiet" onClick={() => onNavigate("login")}>
              Log in
            </button>
            <button className="btn" onClick={() => onNavigate("register")}>
              Create account
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
