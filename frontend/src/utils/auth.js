// Simple client-side auth for demo purposes.
// This is NOT secure authentication (no backend). It just stores a user session in localStorage.

const USER_KEY = "ai-smart-daily-planner.user.v1";
const USERS_KEY = "ai-smart-daily-planner.users.v1";

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function loadUsersMap() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function saveUsersMap(map) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(map || {}));
  } catch {
    // ignore
  }
}

export function getRegisteredUserByEmail(email) {
  const key = normalizeEmail(email);
  if (!key) return null;
  const users = loadUsersMap();
  return users[key] || null;
}

export function registerUser({ name, email }) {
  const trimmedName = String(name || "").trim();
  const normalizedEmail = normalizeEmail(email);

  if (!trimmedName) {
    return { ok: false, error: "Please enter your name." };
  }

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const users = loadUsersMap();
  if (users[normalizedEmail]) {
    return { ok: false, error: "Account already exists. Please sign in." };
  }

  const user = {
    name: trimmedName,
    email: normalizedEmail,
    createdAt: Date.now(),
  };

  users[normalizedEmail] = user;
  saveUsersMap(users);
  return { ok: true, user };
}

export function loginWithEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  const user = getRegisteredUserByEmail(normalizedEmail);
  if (!user) {
    return { ok: false, error: "Account not found. Please sign up first." };
  }
  return { ok: true, user };
}

export function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.email) return null;
    if (!parsed.token) return null;
    return { ...parsed, email: normalizeEmail(parsed.email) };
  } catch {
    return null;
  }
}

export function saveUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearUser() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}
