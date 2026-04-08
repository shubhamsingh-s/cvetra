from fastapi import APIRouter, UploadFile, Form, Depends
from services.parser import parse_resume
from services.embedder import embed, cosine_similarity
from services.gemini import analyze
from services.scorer import calculate_score

router = APIRouter()

@router.post('/analyze')
async def analyze_resume(
    file: UploadFile,
    jd_text: str = Form(''),
    job_id: str = Form(None)
):
    # Dummy mock endpoint for now conforming to the blueprint
    file_bytes = await file.read()
    resume_text = parse_resume(file_bytes, file.filename)
    resume_emb = embed(resume_text)
    jd_emb = embed(jd_text) if jd_text else None
    semantic_sim = cosine_similarity(resume_emb, jd_emb) if jd_emb else 0.5
    gemini_data = analyze(resume_text, jd_text)
    scores = calculate_score(semantic_sim, gemini_data)
    
    return {'status': 'ok', 'analysis': {**scores, **gemini_data}}
