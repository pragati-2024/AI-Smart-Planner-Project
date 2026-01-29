function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function isYesterdayKey(candidate, today = todayKey()) {
  if (!candidate) return false;
  const [y, m, d] = today.split("-").map((v) => Number(v));
  const t = new Date(y, (m || 1) - 1, d || 1);
  const cParts = candidate.split("-").map((v) => Number(v));
  if (cParts.length !== 3) return false;
  const c = new Date(cParts[0], (cParts[1] || 1) - 1, cParts[2] || 1);
  const diffDays = Math.round((t - c) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export function loadStats(storageKey) {
  const defaults = {
    totalPoints: 0,
    streak: 0,
    lastCompletionDate: null,
    unlockedThemes: ["light", "dark"],
  };

  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = safeParse(raw);
    if (!parsed || typeof parsed !== "object") return defaults;

    const next = {
      ...defaults,
      ...parsed,
      totalPoints: Number(parsed.totalPoints || 0),
      streak: Number(parsed.streak || 0),
      lastCompletionDate: parsed.lastCompletionDate || null,
      unlockedThemes: Array.isArray(parsed.unlockedThemes)
        ? parsed.unlockedThemes
        : ["light", "dark"],
    };

    // Ensure base themes always unlocked
    const set = new Set(next.unlockedThemes);
    set.add("light");
    set.add("dark");
    next.unlockedThemes = Array.from(set);

    // Restore/decay streak if user missed days
    const today = todayKey();
    if (next.lastCompletionDate && next.lastCompletionDate !== today) {
      const keep = isYesterdayKey(next.lastCompletionDate, today);
      if (!keep) next.streak = 0;
    }

    return next;
  } catch {
    return defaults;
  }
}

export function saveStats(storageKey, stats) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function awardCompletion(stats, points) {
  const today = todayKey();
  const last = stats.lastCompletionDate;
  let streak = stats.streak || 0;

  if (last === today) {
    // already counted today
  } else if (isYesterdayKey(last, today)) {
    streak = streak + 1;
  } else {
    streak = 1;
  }

  return {
    ...stats,
    totalPoints: Number(stats.totalPoints || 0) + Number(points || 0),
    streak,
    lastCompletionDate: today,
  };
}
