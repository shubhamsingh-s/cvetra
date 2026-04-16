Deploying the backend to Render (recommended steps)

1. Create a new Web Service on Render using the repository.

2. Set the build and start commands:

   - Build: `pip install -r backend/requirements.txt`
   - Start: `gunicorn -k uvicorn.workers.UvicornWorker backend.main:app -b 0.0.0.0:$PORT --workers 1`

3. Configure environment variables (copy from `.env.example`):
   - `MONGO_URI` — your MongoDB Atlas connection string (store as a secret)
   - `MONGO_DB` — database name (e.g., `cvetra`)
   - `AI_ENGINE_URL` — URL of the AI engine service (deploy ai-engine separately)

4. Ensure the AI engine is deployed (ai-engine folder) and set its `AI_ENGINE_URL` accordingly.

5. Health & ports: Render will set `PORT`; the app reads it from env automatically.

Notes:
- Use Atlas network access rules to allow Render outbound IPs or set proper VPC peering.
- Use small instance types for cost-effective runs; increase as traffic grows.
