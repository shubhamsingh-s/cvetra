from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from bson import ObjectId
from services.db import get_users_collection, get_resumes_collection, get_jobs_collection, get_matches_collection
from services.gemini import analyze as analyze_with_gemini
from services.scorer import calculate_score
from services.embedder import embed, cosine_similarity
import datetime

router = APIRouter()

class ApplyRequest(BaseModel):
    userId: str
    jobId: str

@router.post("/apply")
async def apply_job(payload: ApplyRequest):
    users = get_users_collection()
    resumes = get_resumes_collection()
    jobs = get_jobs_collection()

    # 1. Fetch Student
    user = await users.find_one({"_id": ObjectId(payload.userId)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Fetch Latest Resume
    resume = await resumes.find_one({"userId": ObjectId(payload.userId)})
    if not resume:
        raise HTTPException(status_code=400, detail="No resume found for this student. Please upload one first.")

    # 3. Fetch Job
    job = await jobs.find_one({"_id": ObjectId(payload.jobId)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 4. Run AI Analysis
    resume_text = resume.get("parsedText", "")
    jd_text = job.get("description", "")
    
    try:
        # 4.1 Perform Semantic Conceptual Analysis
        # Get embeddings for both resume and job description
        resume_vec = embed(resume_text)
        jd_vec = embed(jd_text)
        semantic_sim = cosine_similarity(resume_vec, jd_vec)

        # 4.2 Use Gemini service for multi-factor analysis
        analysis = analyze_with_gemini(resume_text, jd_text)
        
        # Calculate final composite scores using the scores from Gemini + Semantic Embeddings
        scores = calculate_score(semantic_sim, analysis)
        analysis.update(scores)
    except Exception as e:
        analysis = {"error": str(e), "ats_score": 0}

    # 5. Save to Matches (Used by Recruiter Dashboard)
    # The Node.js ranking endpoint expects records in the 'matches' collection
    match_record = {
        "resumeId": resume["_id"],
        "jobId": job["_id"],
        "matchScore": int(analysis.get("ats_score", 0)),
        "semanticScore": float(analysis.get("semantic_score", 0.75)),
        "shortlist": False,
        "invited": False,
        "createdAt": datetime.datetime.utcnow()
    }

    matches_col = get_matches_collection()
    res = await matches_col.insert_one(match_record)
    
    return {
        "status": "ok", 
        "match_id": str(res.inserted_id),
        "analysis": analysis
    }
