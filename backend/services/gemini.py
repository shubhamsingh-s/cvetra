import google.generativeai as genai
import json, os

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
gemini = genai.GenerativeModel('gemini-1.5-flash')

ANALYSIS_PROMPT = '''
You are an expert ATS system and career coach.
Analyze this resume against the job description.
Return ONLY valid JSON with these exact keys:
{{
  "matched_skills": ["list of matched skills"],
  "missing_skills": ["list of missing skills"],
  "strengths": ["2-4 strength statements"],
  "checklist": [{{"title": "", "description": "", "impact_pts": 5, "priority": ""}}],
  "heatmap_segments": [{{"text": "", "label": "match|partial|missing"}}],
  "career_prediction": {{"next_role": "", "salary_range": "", "timeline": "", "skill_gaps": []}},
  "interview_questions": ["5 questions"],
  "fraud_flags": {{"keyword_stuffing": false, "exp_anomaly": false, "details": ""}},
  "improved_summary": "rewritten summary paragraph"
}}
Resume: {resume_text}
Job Description: {jd_text}
'''

def analyze(resume_text: str, jd_text: str) -> dict:
    prompt = ANALYSIS_PROMPT.format(
        resume_text=resume_text[:3000],
        jd_text=jd_text[:2000]
    )
    resp = gemini.generate_content(prompt)
    text = resp.text.strip().lstrip('```json').rstrip('```')
    try:
        return json.loads(text)
    except Exception:
        return {}
