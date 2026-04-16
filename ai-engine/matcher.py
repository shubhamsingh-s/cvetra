from typing import Dict, Any, List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from resume_parser import extract_keywords, extract_skills, extract_years_of_experience, normalize_text

# Global vectorizer for caching if needed, but TF-IDF is so fast we can run it per request for stability
def _compute_tfidf_similarity(resume_text: str, jd_text: str) -> float:
    if not jd_text.strip() or not resume_text.strip():
        return 0.0
    
    try:
        vectorizer = TfidfVectorizer(stop_words='english', lowercase=True)
        # Combine both to ensure the same vocabulary
        tfidf_matrix = vectorizer.fit_transform([resume_text, jd_text])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(similarity)
    except Exception as e:
        print(f"Similarity error: {e}")
        return 0.0

def keyword_match_score(resume_text: str, jd_text: str) -> float:
    # Use normalized text for keyword matching
    jd_keywords = extract_keywords([jd_text], top_k=50)
    resume_keywords = extract_keywords([resume_text], top_k=200)
    
    jd_set = set([k.lower() for k in jd_keywords])
    res_set = set([k.lower() for k in resume_keywords])
    
    matched = jd_set & res_set
    pct = len(matched) / max(len(jd_set), 1)
    
    return pct, list(matched), list(jd_set - res_set)

def formatting_score(resume_text: str) -> float:
    text = resume_text.lower()
    sections = ['experience', 'education', 'skills', 'projects', 'summary']
    found = sum(1 for s in sections if s in text)
    return found / len(sections)

def section_completeness(resume_text: str) -> Dict[str, bool]:
    text = resume_text.lower()
    return {s: (s in text) for s in ['experience', 'education', 'skills', 'summary']}

def score_resume(resume_text: str, jd_text: str) -> Dict[str, Any]:
    rtext = normalize_text(resume_text)
    jtext = normalize_text(jd_text)
    
    # NEW: Highly memory-efficient TF-IDF similarity
    semantic = _compute_tfidf_similarity(rtext, jtext)
    
    kw_pct, matched, missing = keyword_match_score(rtext, jtext)
    fmt = formatting_score(rtext)
    sections = section_completeness(rtext)
    years = extract_years_of_experience(rtext)

    # Simple weighted ATS score
    # We increase the semantic weight slightly since TF-IDF is more "keyword-string" based
    semantic_w = 0.50
    keyword_w = 0.30
    format_w = 0.20
    
    ats = round((semantic * 100) * semantic_w + (kw_pct * 100) * keyword_w + (fmt * 100) * format_w)

    return {
        'ats_score': max(0, min(100, ats)),
        'semantic_score': semantic,
        'keyword_match_pct': kw_pct,
        'matched_keywords': matched,
        'missing_keywords': missing,
        'formatting_score': fmt,
        'sections': sections,
        'years_experience': years,
    }
