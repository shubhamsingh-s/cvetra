from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services import nlp_model

router = APIRouter()


class PredictRequest(BaseModel):
    text: str


class TrainRequest(BaseModel):
    texts: List[str]
    labels: List[str]


@router.post('/predict')
def predict(req: PredictRequest):
    return nlp_model.predict(req.text)


@router.post('/train')
def train(req: TrainRequest):
    if len(req.texts) != len(req.labels):
        return {'error': 'texts_and_labels_length_mismatch'}
    return nlp_model.train(req.texts, req.labels)
