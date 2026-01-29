// Simple client-side auth for demo purposes.
// This is NOT secure authentication (no backend). It just stores a user session in localStorage.

const USER_KEY = "ai-smart-daily-planner.user.v1";

export function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.email) return null;
    return parsed;
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
