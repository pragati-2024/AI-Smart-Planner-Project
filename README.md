# AI Smart Planner

A modern daily planner with a React (Vite) frontend and an Express + MongoDB backend.
It uses a simple “AI rule” (priority → time block) to group tasks into Morning/Afternoon/Evening, supports a demo local login, and adds gamification with points, streaks, and unlockable themes.

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

- React (Vite)
- Plain CSS (CSS variables)

**Backend**

- Node.js + Express
- MongoDB (via Mongoose)

**Data / Auth**

- Demo login stored in `localStorage` (name + email)
- Tasks are stored in MongoDB, scoped by email
- Stats (points/streak) + theme selection are stored in `localStorage`

## ▶️ Run Locally (Development)

### 0) Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB URI)

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

Create a `backend/.env` file (do not commit it):

Add your environment values inside `backend/.env` (keep secrets here; never push this file). You will need:

- `PORT`
- `MONGODB_URI`
- (Optional) `CORS_ORIGIN`

Backend runs on `http://localhost:5000`.

Health check:

- `GET http://localhost:5000/api/health`

### 2) Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

The frontend calls the backend at `/api/*` using Vite's dev proxy (see `frontend/vite.config.js`).

### Optional: Configure API base URL

If you want to run without the Vite proxy (or for production builds), create `frontend/.env`:

Put your backend URL in `frontend/.env` (do not commit it), e.g. set `VITE_API_URL`.

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

---

AI Smart Planner.
