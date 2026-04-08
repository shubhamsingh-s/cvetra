from fastapi import APIRouter
router = APIRouter()
@router.post("/apply")
async def apply_job(): return {"status": "ok"}
