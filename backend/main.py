import os
from dotenv import load_dotenv

# Load environment variables from .env file before anything else is initialized
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, resume, jobs, applications, recruiter, nlp
from services.db import wait_until_available, ensure_indexes
import asyncio
import logging
import httpx
import os

logger = logging.getLogger('backend')
logging.basicConfig(level=logging.INFO)

app = FastAPI(title='TalentIQ API', version='1.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])

@app.get("/")
def home():
    return {"message": "Backend running successfully on Render 🚀"}


@app.on_event('startup')
async def startup_checks():
    # wait briefly for MongoDB to be reachable (useful in container orchestration)
    ok = await wait_until_available(timeout=8)
    if ok:
        # create recommended indexes
        try:
            await ensure_indexes()
        except Exception:
            pass
    else:
        # not critical: service can still operate in degraded mode
        pass


@app.get('/health')
async def health():
    """Return health status for backend services (db + AI engine)."""
    db_ok = False
    try:
        db_ok = await asyncio.get_event_loop().run_in_executor(None, lambda: __import__('services.db').services.db.is_connected())
    except Exception:
        # fallback: call the helper directly
        try:
            from services.db import is_connected as _is_conn
            db_ok = _is_conn()
        except Exception:
            db_ok = False

    ai_url = os.getenv('AI_ENGINE_URL')
    ai_ok = None
    if ai_url:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                r = await client.get(ai_url)
                ai_ok = r.status_code < 500
        except Exception:
            ai_ok = False

    return {"db": db_ok, "ai_engine": ai_ok}

app.include_router(auth.router, prefix='/api/auth')
app.include_router(resume.router, prefix='/api/resume')
app.include_router(jobs.router, prefix='/api/jobs')
app.include_router(applications.router, prefix='/api/applications')
app.include_router(recruiter.router, prefix='/api/recruiter')
app.include_router(nlp.router, prefix='/api/nlp')
