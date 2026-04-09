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
