from typing import Dict, Any, List
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from .resume_parser import extract_keywords, extract_skills, extract_years_of_experience, normalize_text

_embedder = None

def _get_embedder():
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer('all-MiniLM-L6-v2')
    return _embedder

def _cosine(a: np.ndarray, b: np.ndarray) -> float:
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def compute_embedding(text: str) -> List[float]:
    model = _get_embedder()
    vec = model.encode([text[:2000]])[0]
    return vec.tolist()

def compute_similarity(resume_text: str, jd_text: str) -> float:
    a = np.array(compute_embedding(resume_text))
    b = np.array(compute_embedding(jd_text))
    return _cosine(a, b)

def keyword_match_score(resume_text: str, jd_text: str) -> float:
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
    semantic = compute_similarity(rtext, jtext)
    kw_pct, matched, missing = keyword_match_score(rtext, jtext)
    fmt = formatting_score(rtext)
    sections = section_completeness(rtext)
    years = extract_years_of_experience(rtext)

    # Simple weighted ATS score
    semantic_w = 0.45
    keyword_w = 0.35
    format_w = 0.2
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
