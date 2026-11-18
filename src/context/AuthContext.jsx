import { createContext, useContext, useState } from "react";

/*
 * DEMO AUTHENTICATION (front-end only).
 * Accounts live in this browser's localStorage and passwords are hashed with
 * SHA-256. This is fine for a learning project but is NOT real security:
 * anyone with access to the browser can read the data. A real app needs a
 * backend (e.g. JWT/session auth with salted slow hashes such as bcrypt).
 */

const USERS_KEY = "weather_users";
const SESSION_KEY = "weather_session";

const AuthContext = createContext(null);

async function hash(text) {
  if (globalThis.crypto?.subtle) {
    const buf = await globalThis.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(text)
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback for very old browsers (not cryptographically strong).
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = (h * 33) ^ text.charCodeAt(i);
  return String(h >>> 0);
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJSON(SESSION_KEY, null));

  const register = async ({ name, email, password }) => {
    const users = readJSON(USERS_KEY, []);
    const cleanEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email === cleanEmail)) {
      throw new Error("An account with this email already exists.");
    }
    users.push({
      name: name.trim(),
      email: cleanEmail,
      passwordHash: await hash(password),
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const session = { name: name.trim(), email: cleanEmail };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  };

  const login = async ({ email, password }) => {
    const users = readJSON(USERS_KEY, []);
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email === cleanEmail);
    if (!found || found.passwordHash !== (await hash(password))) {
      throw new Error("Incorrect email or password.");
    }
    const session = { name: found.name, email: found.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
