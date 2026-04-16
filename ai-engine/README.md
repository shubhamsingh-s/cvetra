AI Engine microservice

Endpoints:
- POST /analyze : Accepts `file` (resume upload) and `jd_text` form fields. Returns ATS analysis and extracted skills.
- POST /analyze_text : Accepts `resume_text` and `jd_text` as form fields.

Run locally:
```
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn ai-engine.main:app --reload --port 8001
```
