from fastapi import APIRouter
router = APIRouter()
@router.post("/bulk-upload")
async def bulk_upload(): return {"status": "ok"}
