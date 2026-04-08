def calculate_score(semantic_sim: float, gemini_data: dict) -> dict:
    semantic = round(semantic_sim * 100)
    matched = len(gemini_data.get('matched_skills', []))
    missing = len(gemini_data.get('missing_skills', []))
    skills = round(matched / max(matched + missing, 1) * 100)
    checklist = gemini_data.get('checklist', [])
    max_pts = sum(c.get('impact_pts', 5) for c in checklist)
    done_pts = sum(c.get('impact_pts', 5) for c in checklist
                   if c.get('priority') == 'done')
    keyword = round((done_pts / max(max_pts, 1)) * 100)
    ats = round(semantic * .4 + skills * .35 + keyword * .25)
    return {
        'ats_score': max(0, min(100, ats)),
        'semantic_score': semantic / 100,
        'skills_score': skills / 100,
        'keyword_score': keyword / 100,
    }
