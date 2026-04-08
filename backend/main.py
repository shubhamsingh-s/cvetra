import os
from dotenv import load_dotenv

# Load environment variables from .env file before anything else is initialized
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, resume, jobs, applications, recruiter

app = FastAPI(title='TalentIQ API', version='1.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])

@app.get("/")
def home():
    return {"message": "Backend running successfully on Render 🚀"}

app.include_router(auth.router, prefix='/api/auth')
app.include_router(resume.router, prefix='/api/resume')
app.include_router(jobs.router, prefix='/api/jobs')
app.include_router(applications.router, prefix='/api/applications')
app.include_router(recruiter.router, prefix='/api/recruiter')
