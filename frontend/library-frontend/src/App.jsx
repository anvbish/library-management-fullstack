import { useState } from "react";
import { AuthProvider } from "./AuthContext";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import BookList from "./components/BookList";
import AuthForm from "./components/AuthForm";
import "./App.css";

function App() {
  const [view, setView] = useState("home"); // "home" | "books" | "login" | "register"

  return (
    <AuthProvider>
      <Navbar onNavigate={setView} />
      <main className="page">
        {view === "home" && <Home onEnter={() => setView("books")} />}
        {view === "books" && <BookList onNeedLogin={() => setView("login")} />}
        {(view === "login" || view === "register") && (
          <AuthForm mode={view} onSwitch={setView} onDone={() => setView("books")} />
        )}
      </main>
    </AuthProvider>
  );
}

export default App;
