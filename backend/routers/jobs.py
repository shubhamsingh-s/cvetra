from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.db import get_jobs_collection
from bson import ObjectId

router = APIRouter()


class JobIn(BaseModel):
	title: str
	description: str = ""


@router.post("/")
async def create_job(payload: JobIn):
	jobs = get_jobs_collection()
	res = await jobs.insert_one(payload.dict())
	return {"status": "ok", "job_id": str(res.inserted_id)}


@router.get("/")
async def list_jobs():
	jobs = get_jobs_collection()
	docs = []
	async for j in jobs.find().sort([("_id", -1)]).limit(100):
		j['id'] = str(j.get('_id'))
		j.pop('_id', None)
		docs.append(j)
	return {"jobs": docs}

