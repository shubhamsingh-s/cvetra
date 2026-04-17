from fastapi import APIRouter, UploadFile, Form
import os
import httpx

router = APIRouter()


@router.post('/analyze')
async def analyze_resume(
    file: UploadFile,
    jd_text: str = Form(''),
    job_id: str = Form(None)
):
    """Forward resume + JD to the AI engine microservice and return analysis."""
    ai_url = os.getenv('AI_ENGINE_URL', 'http://localhost:8001')
    file_bytes = await file.read()
    files = {'file': (file.filename, file_bytes, file.content_type or 'application/octet-stream')}
    data = {'jd_text': jd_text}
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(f"{ai_url}/analyze", data=data, files=files)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            # fallback: minimal local parsing response
            return {'status': 'error', 'message': str(e)}

from services.gemini import analyze as analyze_with_gemini

@router.post('/analyze_text')
async def analyze_text_route(
    resume_text: str = Form(""),
    jd_text: str = Form("")
):
    """Directly analyze raw resume text against a Job Description using Gemini."""
    try:
        if not resume_text:
            return {"status": "error", "message": "No resume text provided"}
            
        analysis = analyze_with_gemini(resume_text, jd_text)
        return {"status": "ok", "analysis": analysis}
    except Exception as e:
        return {"status": "error", "message": str(e)}
