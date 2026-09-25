import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";

function AuthForm({ mode, onDone, onSwitch }) {
  const isRegister = mode === "register";
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await api.register(form.username, form.password);
      }
      await login(form.username, form.password);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-panel">
      <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
      <p className="muted">
        {isRegister ? "Sign up to borrow books." : "Log in to borrow and return books."}
      </p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Username
          <input value={form.username} onChange={update("username")} required autoComplete="username" />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={update("password")}
            required
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Create account" : "Log in"}
        </button>
      </form>

      <p className="muted small">
        {isRegister ? "Already have an account? " : "New here? "}
        <button className="link" onClick={() => onSwitch(isRegister ? "login" : "register")}>
          {isRegister ? "Log in" : "Create an account"}
        </button>
      </p>
    </section>
  );
}

export default AuthForm;
