import google.generativeai as genai
import json, os, re

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
gemini = genai.GenerativeModel('gemini-1.5-flash')

ANALYSIS_PROMPT = '''
SYSTEM PROMPT:

You are a professional ATS engine used by top recruiters.

Return ONLY valid JSON in this format:

{{
  "candidate_name": "",
  "ats_score": 0,
  "final_verdict": "",
  "match_breakdown": {{
    "skills_match": 0,
    "experience_match": 0,
    "keyword_match": 0
  }},
  "missing_keywords": [],
  "suggestions": []
}}

RULES:
- ATS score must be realistic (0-100), not inflated
- Base score strictly on resume vs job description
- Missing keywords must be exact terms from JD
- Suggestions must be actionable (bullet-based)
- If JD not provided -> reduce accuracy and mention in suggestions

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
            "candidate_name": "Applicant",
            "ats_score": 0,
            "final_verdict": "Error processing scan",
            "match_breakdown": {
                "skills_match": 0,
                "experience_match": 0,
                "keyword_match": 0
            },
            "missing_keywords": [],
            "suggestions": ["Retry Scan: AI engine timeout or parsing error"]
        }
