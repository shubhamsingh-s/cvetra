Deployment checklist — Vercel (frontend) + Render (backend + AI engine)

1) Prepare secrets
- Vercel
  - `VERCEL_TOKEN` (personal token)
  - `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` (available in Vercel project settings)
- Render
  - `RENDER_API_KEY` (service API key from Render account)
  - `RENDER_SERVICE_ID_BACKEND` (service id for `talentiq-backend`)
  - `RENDER_SERVICE_ID_AIENGINE` (service id for `talentiq-ai-engine`)
- MongoDB Atlas
  - `MONGO_URI` (mongodb+srv://... connection string)
  - `MONGO_DB` (database name)
- Other
  - `GEMINI_API_KEY` (if using Google Generative AI)
  - `AI_ENGINE_URL` (pointing to the deployed ai-engine service if backend will call it directly)

2) Deploy AI engine to Render (or another host)
- Create a new Web Service on Render using `ai-engine` folder.
- Use `ai-engine/requirements.txt` for build.
- Start command: `cd ai-engine && gunicorn -k uvicorn.workers.UvicornWorker ai-engine.main:app -b 0.0.0.0:$PORT --workers 1`
- Set `PORT=8001` and any model/API keys as secrets.

3) Deploy Backend to Render
- Create a new Web Service on Render pointing to repo root.
- Build command: `pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r backend/requirements.txt`
- Start command: `cd backend && gunicorn -k uvicorn.workers.UvicornWorker main:app -b 0.0.0.0:$PORT --workers 1`
- Set environment variables: `MONGO_URI`, `MONGO_DB`, `AI_ENGINE_URL`, `GEMINI_API_KEY`.
- OPTIONAL: add health check URL `/health`.

3.b) Deploy Node backend (optional / alternate flow)
- Add a Render Web Service for the Node backend using the `backend_node` folder.
- Build command: `cd backend_node && npm ci`
- Start command: `cd backend_node && npm start`
- Set environment variables: `MONGO_URI`, `PORT` (5000), `JWT_SECRET`, `AI_ENGINE_URL`.
- Ensure `RENDER_SERVICE_ID_NODE` is stored in GitHub secrets if using the provided GH Action.

4) Deploy Frontend to Vercel
- In Vercel, link the repo and point the root to `frontend` folder.
- Build command: `npm run build` (default Next.js)
- Set environment variables in Vercel: `NEXT_PUBLIC_API_URL` = `https://<backend-service>.onrender.com`

5) Configure CORS & Network
- Ensure backend CORS allows Vercel origin or use `*` for testing.
- If using MongoDB Atlas, ensure network allows Render outbound IPs or use VPC peering.

6) Setup GitHub Actions (optional)
- Add secrets in GitHub repository settings: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `RENDER_API_KEY`, `RENDER_SERVICE_ID_BACKEND`, `RENDER_SERVICE_ID_AIENGINE`.
- Push to `main` to trigger workflows in `.github/workflows/`.
 - Also add `RENDER_SERVICE_ID_NODE` if deploying the Node backend via GH Actions.

Auto-detection of Render service IDs (optional)
- The provided GitHub Action attempts to auto-detect Render service IDs by name using the Render API when corresponding GitHub secrets are not set.
- Ensure your Render services are named exactly:
  - `talentiq-backend` (Node backend)
  - `talentiq-ai-engine` (Python AI engine)
- If you prefer to set explicit IDs, add these secrets to GitHub: `RENDER_SERVICE_ID_BACKEND`, `RENDER_SERVICE_ID_AIENGINE`, `RENDER_SERVICE_ID_NODE`.
- If your Render service names differ from the defaults above, you can provide custom names to the workflow instead of renaming services.
  Note: the primary backend service should be named `talentiq-backend` and point to the Node backend implementation located in `/backend_node`.

Custom service name mapping (optional)
- Set the following GitHub repository variables or secrets to map your custom Render service names (the workflow will use these names for fuzzy lookup):
  - `RENDER_SERVICE_NAME_BACKEND` (e.g. `mycompany-backend`)
  - `RENDER_SERVICE_NAME_AIENGINE` (e.g. `mycompany-ai`)
  - `RENDER_SERVICE_NAME_NODE` (e.g. `mycompany-node`)
- The workflow does: exact match → case-insensitive contains → prefix match. If a matching service is found, its ID is used automatically.
- Alternatively, explicitly set the service IDs as secrets: `RENDER_SERVICE_ID_BACKEND`, `RENDER_SERVICE_ID_AIENGINE`, `RENDER_SERVICE_ID_NODE`.

Vercel rewrites
- `frontend/vercel.json` is configured to proxy `/api/*` to the Node backend host `https://talentiq-backend-node.onrender.com` by default. Update this hostname if your Render service uses a different domain.

7) Smoke tests
- After deploy, test endpoints:
  - `GET /` on backend
  - `GET /health` on backend
  - `POST /api/resume/analyze` via frontend upload page
  - Recruiter endpoints: `GET /api/recruiter/job/<job_id>/candidates`

8) Post-deploy checks
- Monitor logs on Render and Vercel for errors.
- Confirm indexes created in MongoDB Atlas (see `candidates` collection).
- Validate AI engine endpoints and model availability.

Troubleshooting tips
- If deployment fails due to missing wheels or large models, consider using smaller transformer models or a pre-built Docker image.
- For heavy model loads, consider deploying ai-engine on a GPU-enabled host or managed inference endpoint.

