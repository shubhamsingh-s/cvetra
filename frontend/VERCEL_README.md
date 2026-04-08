Vercel Deployment Notes

1. Environment Variables
- Set `NEXT_PUBLIC_API_URL` to your backend URL (e.g. https://talentiq-backend-pyhf.onrender.com) in Vercel Dashboard -> Project -> Settings -> Environment Variables.
- Use `Environment` selector to choose `Preview` or `Production` as needed.

2. Build & Framework
- Framework: Next.js (if using Next) — Vercel detects automatically.
- Build Command: `npm run build`
- Output Directory: (Next.js handles automatically)

3. CORS & Cookies
- If backend uses cookie auth, set `Access-Control-Allow-Credentials: true` and allow your frontend origin.
- Example (FastAPI):

```py
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
  CORSMiddleware,
  allow_origins=["https://your-front-end.vercel.app"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)
```

4. Quick deploy steps
- Push to GitHub.
- Import project on Vercel and link the repo.
- Add environment variables in Project Settings.
- Trigger a deployment.

5. Troubleshooting
- `CORS` errors: check `allow_origins` and headers on backend.
- Missing env at runtime: ensure env var is set in Vercel BEFORE deploy; `NEXT_PUBLIC_` vars are inlined at build-time.
- 401/403: confirm token/cookie is sent and accepted by backend.

6. Local testing
- Create `.env.local` in `frontend/` with `NEXT_PUBLIC_API_URL`.
- Run `npm run dev` and test requests.
