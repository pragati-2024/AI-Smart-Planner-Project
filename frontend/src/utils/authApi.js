function getApiBase() {
  try {
    const raw = import.meta?.env?.VITE_API_URL;
    const base = typeof raw === "string" ? raw.trim() : "";
    return base.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

async function requestJson(path, options) {
  const apiBase = getApiBase();
  const url = apiBase ? `${apiBase}${path}` : path;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      typeof body === "object" && body?.error ? body.error : "Request failed";
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

export function signupWithEmail({ name, email }) {
  return requestJson("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email }),
  });
}

export function loginWithEmail(email) {
  return requestJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function signupWithGoogle(credential) {
  return requestJson("/api/auth/google/signup", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export function loginWithGoogle(credential) {
  return requestJson("/api/auth/google/login", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}
