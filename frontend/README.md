# React + Vite

# AI Smart Daily Planner (Frontend)

This folder contains the React (Vite) UI.

For full-stack setup (backend + MongoDB + frontend), see the main README in the repo root.

## Dev

```bash
npm install
npm run dev
```

The UI expects a backend at `/api/*`.
In development, Vite proxies `/api` to `http://localhost:5000` (see `vite.config.js`).

If you prefer an explicit backend URL (e.g., for production builds), set `VITE_API_URL` in `frontend/.env`.
