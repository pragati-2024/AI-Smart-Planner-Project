# AI Smart Daily Planner

A modern, responsive daily planner frontend built with React. It uses a simple “AI rule” (priority → time block) to group tasks into Morning/Afternoon/Evening, supports local login, and adds gamification with points, streaks, and unlockable themes.

## ✅ What’s Included

- **Task management:** add, edit, delete, complete
- **Today’s Plan:** tasks grouped into **Morning / Afternoon / Evening**
- **Filters:** search, filter by priority/status, sort (Newest/Oldest/Title)
- **Progress:** total/completed/pending + clear completed/all
- **Backup:** download/import JSON backup (local only)
- **Local login (demo):** per-user task storage via email key (no backend)
- **Rewards:** points + streak tracking + unlockable themes

## 🧠 AI Scheduling (Rule-Based)

- High → Morning
- Medium → Afternoon
- Low → Evening

## 🎁 Rewards, Points, Streaks & Theme Unlocks

- Completing a task gives points (only **once per task**):
  - High: +30
  - Medium: +20
  - Low: +10
- Streak increases when you complete at least 1 task per day.
- Themes unlock automatically when you reach requirements:
  - **Dracula Dev**: 120 points
  - **Nord Dev**: 220 points
  - **Monokai Dev**: 320 points
  - **Kawaii Fun**: 7-day streak
  - **Pixel Fun**: 14-day streak

Open **Themes** (top bar) to apply unlocked themes.

## 🧰 Tech Stack

**Frontend**

- React (Vite + React)
- JavaScript (ESM)
- Plain CSS (CSS variables + responsive layout)

**Storage (local only)**

- localStorage for: user session, tasks (per-user), stats (points/streak), theme

> Note: This repo currently contains only the frontend (no server/database).

## ▶️ Run Locally (Development)

From the project root:

```bash
cd frontend
npm install
npm run dev
```

Then open:

- http://localhost:5173/

## 🏗️ Build (Production)

```bash
cd frontend
npm run build
npm run preview
```

Or from the root folder (Windows friendly):

```bash
npm --prefix "./frontend" run build
```

## 🔄 App Workflow (How It Works)

1. **Login (local/demo)**: enter name + email → app stores session locally.
2. **Add Task**: choose priority + estimated time → app assigns a time block using the rule.
3. **Today’s Plan**: view tasks by time block, use search/filters, edit tasks, complete tasks.
4. **Rewards**: completing tasks increases points and updates your streak; new themes unlock.
5. **Progress + Backup**: view completion stats and export/import backups.

## 👩‍💻 Author

Pragati Bansal

---

This project is developed for learning/portfolio purposes.
