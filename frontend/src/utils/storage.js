// localStorage helper functions (keeps App.jsx cleaner).
// Supports per-user keys so multiple users on the same browser have separate tasks.

const DEFAULT_STORAGE_KEY = "ai-smart-daily-planner.tasks.v1";

export function loadTasks(storageKey = DEFAULT_STORAGE_KEY) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTasks(storageKey = DEFAULT_STORAGE_KEY, tasks) {
  // Allow old call style saveTasks(tasks)
  if (Array.isArray(storageKey) && tasks === undefined) {
    tasks = storageKey;
    storageKey = DEFAULT_STORAGE_KEY;
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  } catch {
    // If storage fails (quota/private mode), we silently ignore.
  }
}
