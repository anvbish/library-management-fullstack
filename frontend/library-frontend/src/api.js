export const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const enc = encodeURIComponent;

const store = {
  access: () => localStorage.getItem("access_token"),
  refresh: () => localStorage.getItem("refresh_token"),
  set: (a, r) => {
    if (a) localStorage.setItem("access_token", a);
    if (r) localStorage.setItem("refresh_token", r);
  },
  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};
export const tokenStore = store;

async function refreshTokens() {
  const refresh = store.refresh();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/refresh?refresh_token=${enc(refresh)}`, { method: "POST" });
    if (!res.ok) throw new Error("refresh failed");
    const data = await res.json();
    store.set(data.access_token, null);
    return true;
  } catch {
    store.clear();
    window.dispatchEvent(new Event("auth:logout"));
    return false;
  }
}

async function request(path, { method = "GET", body, auth = true, retry = true } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  const token = store.access();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retry && store.refresh()) {
    if (await refreshTokens()) return request(path, { method, body, auth, retry: false });
  }

  if (!res.ok) {
    let message = `Something went wrong (${res.status}).`;
    try {
      const data = await res.json();
      if (typeof data.detail === "string") message = data.detail;
      else if (Array.isArray(data.detail)) message = data.detail.map((d) => d.msg).join(", ");
    } catch {
      /* Default message */
    }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  
  register: async (username, password) => {
    const data = await request("/register", { method: "POST", body: { username, password }, auth: false });
    if (data?.message !== "User registered successfully") {
      throw new Error(data?.message || "Could not create the account.");
    }
    return data;
  },

  login: async (username, password) => {
    const data = await request("/login", { method: "POST", body: { username, password }, auth: false });
    if (!data?.access_token) {
      throw new Error(data?.message || "Could not log in.");
    }
    store.set(data.access_token, data.refresh_token);
    return data;
  },

  logout: () => store.clear(),

  getBooks: () => request("/books?skip=0&limit=100", { auth: false }),
  addBook: (book) => request("/books", { method: "POST", body: book }),
  updateBook: (title, book) => request(`/books/${enc(title)}`, { method: "PUT", body: book }),
  deleteBook: (title) => request(`/books/${enc(title)}`, { method: "DELETE" }),
  borrowBook: (title) => request(`/borrow/${enc(title)}`, { method: "POST" }),
  returnBook: (title) => request(`/return/${enc(title)}`, { method: "POST" }),
  myBooks: () => request("/my-books"),
};