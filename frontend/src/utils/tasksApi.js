import { loadUser } from "./auth.js";

function getApiBase() {
  try {
    const raw = import.meta?.env?.VITE_API_URL;
    const base = typeof raw === "string" ? raw.trim() : "";
    return base.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

function getAuthHeaders() {
  try {
    const token = loadUser()?.token;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

async function requestJson(path, options) {
  const apiBase = getApiBase();
  const url = apiBase ? `${apiBase}${path}` : path;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (res.status === 204) return null;

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

export function fetchTasks(email) {
  const q = new URLSearchParams({ email: String(email || "") });
  return requestJson(`/api/tasks?${q.toString()}`);
}

export function createTask(email, task) {
  return requestJson("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ email, ...task }),
  });
}

export function patchTask(email, taskId, patch) {
  return requestJson(`/api/tasks/${encodeURIComponent(taskId)}`, {
    method: "PATCH",
    body: JSON.stringify({ email, ...patch }),
  });
}

export function deleteTask(email, taskId) {
  const q = new URLSearchParams({ email: String(email || "") });
  return requestJson(
    `/api/tasks/${encodeURIComponent(taskId)}?${q.toString()}`,
    {
      method: "DELETE",
    },
  );
}

export function clearAllTasks(email) {
  const q = new URLSearchParams({ email: String(email || "") });
  return requestJson(`/api/tasks?${q.toString()}`, {
    method: "DELETE",
  });
}

export function replaceAllTasks(email, tasks) {
  return requestJson("/api/tasks/replace", {
    method: "PUT",
    body: JSON.stringify({ email, tasks: Array.isArray(tasks) ? tasks : [] }),
  });
}
