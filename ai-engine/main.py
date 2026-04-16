import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from resume_parser import extract_text_from_file, normalize_text, extract_skills
from matcher import score_resume

app = FastAPI(title='AI Engine', version='0.1')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])


class AnalyzeResponse(BaseModel):
    ats_score: int
    semantic_score: float
    keyword_match_pct: float
    matched_keywords: list
    missing_keywords: list
    formatting_score: float
    sections: dict
    years_experience: float


@app.post('/analyze', response_model=dict)
async def analyze_resume(file: UploadFile = File(...), jd_text: str = Form('')):
    file_bytes = await file.read()
    resume_text = extract_text_from_file(file_bytes, file.filename)
    skills = extract_skills(resume_text)
    result = score_resume(resume_text, jd_text or '')
    result.update({'extracted_skills': skills, 'resume_text_snippet': resume_text[:2000]})
    return {'status': 'ok', 'analysis': result}


@app.post('/analyze_text', response_model=dict)
async def analyze_text(resume_text: str = Form(...), jd_text: str = Form('')):
    skills = extract_skills(resume_text)
    result = score_resume(resume_text, jd_text or '')
    result.update({'extracted_skills': skills, 'resume_text_snippet': resume_text[:2000]})
    return {'status': 'ok', 'analysis': result}


if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv('PORT', 8001))
    uvicorn.run('main:app', host='0.0.0.0', port=port, reload=True)
