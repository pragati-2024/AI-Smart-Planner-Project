// Theme handling stored in localStorage.
// Supports multiple theme ids (coder/fun) in addition to light/dark.

const THEME_KEY = "ai-smart-daily-planner.theme.v2";

export const THEMES = [
  {
    id: "dark",
    name: "Dark",
    group: "Base",
    description: "Calm dark glass UI.",
    require: null,
  },
  {
    id: "light",
    name: "Light",
    group: "Base",
    description: "Clean bright UI.",
    require: null,
  },
  {
    id: "dracula",
    name: "Dracula Dev",
    group: "Coder",
    description: "High-contrast purple for coders.",
    require: { points: 120 },
  },
  {
    id: "nord",
    name: "Nord Dev",
    group: "Coder",
    description: "Cool nordic blues, low eye strain.",
    require: { points: 220 },
  },
  {
    id: "monokai",
    name: "Monokai Dev",
    group: "Coder",
    description: "Warm neon accents, terminal vibes.",
    require: { points: 320 },
  },
  {
    id: "kawaii",
    name: "Kawaii Fun",
    group: "Fun",
    description: "Pastel playful (childish) theme.",
    require: { streak: 7 },
  },
  {
    id: "pixel",
    name: "Pixel Fun",
    group: "Fun",
    description: "Candy colors + retro energy.",
    require: { streak: 14 },
  },
];

export const THEME_IDS = THEMES.map((t) => t.id);

export function isThemeId(themeId) {
  return THEME_IDS.includes(themeId);
}

export function themeLabel(themeId) {
  const found = THEMES.find((t) => t.id === themeId);
  return found?.name || "Theme";
}

export function loadTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (isThemeId(raw)) return raw;
    // Backward compatibility for old key if present
    const old = localStorage.getItem("ai-smart-daily-planner.theme.v1");
    if (old === "light" || old === "dark") return old;
    return "dark";
  } catch {
    return "dark";
  }
}

export function saveTheme(themeId) {
  try {
    localStorage.setItem(THEME_KEY, themeId);
  } catch {
    // ignore
  }
}

export function applyTheme(themeId) {
  const root = document.documentElement;
  for (const id of THEME_IDS) root.classList.remove(`theme--${id}`);
  root.classList.add(`theme--${isThemeId(themeId) ? themeId : "dark"}`);
}
