def calculate_score(semantic_sim: float, gemini_data: dict) -> dict:
    # 40% Semantic Match (Holistic alignment)
    semantic = round(semantic_sim * 100)
    
    # Extract AI-driven sub-scores from metadata
    meta = gemini_data.get('scoring_metadata', {})
    
    # 30% Skill Depth (AI evaluation of expertise level)
    skills = meta.get('skill_depth_score', 0)
    if not skills:
        # Fallback to keyword ratio if metadata is missing
        matched = len(gemini_data.get('matched_skills', []))
        missing = len(gemini_data.get('missing_skills', []))
        skills = round(matched / max(matched + missing, 1) * 100)
        
    # 20% Experience Match (Year/Seniority alignment)
    experience = meta.get('experience_match_score', 0)
    
    # 10% Formatting & Clarity
    formatting = meta.get('formatting_score', 50) # default to neutral if missing

    # Final ATS Composite Score
    ats = round(
        semantic * 0.40 + 
        skills * 0.30 + 
        experience * 0.20 + 
        formatting * 0.10
    )

    return {
        'ats_score': max(0, min(100, ats)),
        'semantic_score': semantic / 100,
        'skills_score': skills / 100,
        'experience_score': experience / 100,
        'formatting_score': formatting / 100
    }
