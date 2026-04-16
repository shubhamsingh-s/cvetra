from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import os
import httpx
from services.db import get_candidates_collection, get_jobs_collection
from bson import ObjectId
from typing import List

router = APIRouter()


@router.post("/bulk-upload")
async def bulk_upload():
	return {"status": "ok"}


@router.post('/job/{job_id}/candidate')
async def add_candidate_to_job(job_id: str, file: UploadFile = File(...), name: str = Form(...), email: str = Form(None)):
	jobs = get_jobs_collection()
	job = await jobs.find_one({'_id': ObjectId(job_id)})
	if not job:
		raise HTTPException(status_code=404, detail='Job not found')

	# Send resume to AI engine for analysis
	ai_url = os.getenv('AI_ENGINE_URL', 'http://localhost:8001')
	file_bytes = await file.read()
	files = {'file': (file.filename, file_bytes, file.content_type or 'application/octet-stream')}
	data = {'jd_text': job.get('description', '')}
	async with httpx.AsyncClient(timeout=60.0) as client:
		try:
			resp = await client.post(f"{ai_url}/analyze", data=data, files=files)
			resp.raise_for_status()
			analysis = resp.json().get('analysis', {})
		except Exception as e:
			analysis = {'error': str(e)}

	candidate = {
		'job_id': job_id,
		'name': name,
		'email': email,
		'filename': file.filename,
		'analysis': analysis,
	}

	candidates = get_candidates_collection()
	res = await candidates.insert_one(candidate)
	candidate['id'] = str(res.inserted_id)
	return {'status': 'ok', 'candidate': candidate}


@router.get('/job/{job_id}/candidates')
async def get_ranked_candidates(job_id: str):
	candidates = get_candidates_collection()
	query = {'job_id': job_id}
	docs = []
	async for c in candidates.find(query):
		# normalize id and scores
		c['id'] = str(c.get('_id'))
		c.pop('_id', None)
		analysis = c.get('analysis', {})
		ats = analysis.get('ats_score') or analysis.get('ats', None) or 0
		semantic = analysis.get('semantic_score') or 0
		c['ats_score'] = int(ats) if isinstance(ats, (int, float)) else 0
		c['semantic_score'] = float(semantic) if isinstance(semantic, (int, float)) else 0.0
		# flatten some fields for display
		c['skills'] = analysis.get('matched_skills', [])
		c['experience_years'] = analysis.get('years_experience', 0) or analysis.get('experience_years', 0)
		c['resume_snippet'] = (analysis.get('resume_text_snippet') or '')[:200]
		docs.append(c)

	# sort by ats_score then semantic_score
	docs.sort(key=lambda x: (x.get('ats_score', 0), x.get('semantic_score', 0)), reverse=True)
	return {'job_id': job_id, 'candidates': docs}


