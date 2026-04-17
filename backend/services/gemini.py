import google.generativeai as genai
import json, os, re

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
gemini = genai.GenerativeModel('gemini-1.5-flash')

ANALYSIS_PROMPT = '''
You are an expert ATS system and career coach.
Analyze this resume. If a specific job description is provided, match against it. 
IF ONLY a "General" or no job description is provided, perform a "Professional Excellence Audit" against industry benchmarks for top tech roles.

Return ONLY valid JSON with these exact keys:
{{
  "matched_skills": ["top skills found"],
  "missing_skills": ["missing essential industry skills"],
  "strengths": ["2-4 strength statements"],
  "checklist": [
    {{"title": "Add Profile Summary", "description": "Crucial for visibility", "impact_pts": 15, "priority": "High"}},
    {{"title": "Quantify Impact", "description": "Use % and $ metrics", "impact_pts": 20, "priority": "High"}}
  ],
  "career_prediction": {{"next_role": "Senior Engineer", "salary_range": "$120k-$150k"}},
  "scoring_metadata": {{
    "skill_depth_score": 85,
    "experience_match_score": 80,
    "formatting_score": 90
  }}
}}

Resume: {resume_text}
JD/Context: {jd_text}
'''

def analyze(resume_text: str, jd_text: str) -> dict:
    prompt = ANALYSIS_PROMPT.format(
        resume_text=resume_text[:4000],
        jd_text=jd_text[:2000] if jd_text else "General Professional Audit"
    )
    
    try:
        resp = gemini.generate_content(prompt)
        # Clean potential markdown JSON formatting
        raw_text = resp.text.strip()
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return json.loads(raw_text)
    except Exception as e:
        print(f"Gemini Error: {e}")
        return {
            "ats_score": 0,
            "checklist": [{"title": "Retry Scan", "description": "AI engine timeout", "impact_pts": 0, "priority": "Low"}]
        }
