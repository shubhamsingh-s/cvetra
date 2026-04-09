# Cvetra — TalentIQ (NLP + Web)

This repository contains a backend (FastAPI) and frontend (Next.js) for a Talent/Resume NLP application. Below is a concise map of important files and what they do so you can quickly find and modify each piece.

## Quick start
- Create a Python environment and install backend dependencies:

```bash
python -m venv .venv
source .venv/bin/activate   # or .venv\\Scripts\\activate on Windows
pip install -r backend/requirements.txt
```

- Run backend (from repo root):

```bash
uvicorn backend.main:app --reload --port 10000
```

- Start frontend (from `frontend`):

```bash
cd frontend
npm install
npm run dev
```

## Repo layout and responsibilities

- `backend/` — FastAPI backend
  - `main.py` — API entrypoint, registers routers and CORS
  - `routers/` — FastAPI routers for API endpoints
    - `auth.py` — authentication endpoints
    - `resume.py` — resume parsing endpoints
    - `jobs.py` — job listing endpoints
    - `applications.py` — application management
    - `recruiter.py` — recruiter-specific endpoints
    - `nlp.py` — (new) NLP model endpoints (train, predict)
  - `services/` — background services and ML code
    - `nlp_model.py` — (new) simple sklearn-based NLP model (train, save, load, predict)
  - `requirements.txt` — Python dependencies (updated to include `scikit-learn`, `joblib`)

- `frontend/` — Next.js frontend
  - `src/app/` — pages (login, register, dashboard, upload, etc.)
  - `src/components/` — UI components
  - `lib/api.ts` — client API helpers — update to call `/api/nlp` (see README changes)

## New additions (what I added)
- `backend/services/nlp_model.py` — Minimal scikit-learn pipeline using `TfidfVectorizer` + `LogisticRegression` with `train()`, `save()`, `load()`, `predict()` helpers. Model serialized with `joblib` to `backend/models/nlp_model.joblib` when trained.
- `backend/routers/nlp.py` — FastAPI router exposing `POST /api/nlp/predict` and `POST /api/nlp/train`.
- `.gitignore` — ignores Python virtual envs, node_modules, model artifacts and local env files.

## Git
I added `.gitignore`. To initialize and push the repo:

```bash
git init
git add .
git commit -m "chore: add README, NLP service and router, update requirements"
git branch -M main
git remote add origin <your-remote-url>
git push -u origin main
```

## Notes & next steps you might want
- Replace the placeholder training dataset in `services/nlp_model.py` with your labeled data and call the `/api/nlp/train` endpoint or run a script.
- Improve model (use transformers) for high quality production scoring.
- Add frontend UI pages to call `/api/nlp/predict` (I can add a minimal frontend page if you want).

## Deployment

Backend (Render):
- A `render.yaml` is included at the repo root to deploy the `backend/` service to Render. It installs `backend/requirements.txt` and starts Uvicorn. To deploy:
  1. Create a new Web Service on Render and connect your repository (or use the `render.yaml`).
  2. In Render dashboard, set environment variables (at minimum):
     - `GEMINI_API_KEY` (your API key)
     - `SECRET_KEY` (production secret)
     - any DB/Redis credentials used by your app
  3. Render will run the `buildCommand` and `startCommand` defined in `render.yaml`.

Frontend (Vercel):
- This project uses a `frontend/` Next.js app. When creating a Vercel project, set the project root to the `frontend` folder (monorepo setting) so Vercel runs `npm install` and `npm run build` there. Also set these Environment Variables in the Vercel project settings:
  - `NEXT_PUBLIC_API_URL` — the full URL of your backend (for example `https://<your-backend>.onrender.com`)
  - Any auth or API keys you expose to the browser (only if safe and necessary)

Tips:
- Keep secrets (Gemini/OpenAI keys, DB passwords) only on the backend and never commit them to the repository.
- Confirm the backend URL and add it to `NEXT_PUBLIC_API_URL` in Vercel before deploying the frontend so client requests target the correct host.

If you want, I can (A) set `frontend/.env.example` with a placeholder `NEXT_PUBLIC_API_URL`, (B) create a small `/predict` page and call the endpoint from the UI, or (C) push these changes to a remote. Which would you like next?
