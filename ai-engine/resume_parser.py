import io
import re
from typing import List, Dict
import pdfplumber
from docx import Document
from sklearn.feature_extraction.text import TfidfVectorizer
import spacy

_nlp = None

def _get_nlp():
    global _nlp
    if _nlp is None:
        # Use a blank model instead of 'en_core_web_sm' to save ~150MB of RAM
        # This still provides tokenization and noun_chunks capability for basic parsing
        _nlp = spacy.blank('en')
    return _nlp

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    ext = filename.lower().split('.')[-1]
    try:
        if ext == 'pdf':
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                return '\n'.join(p.extract_text() or '' for p in pdf.pages)
        elif ext in ('docx', 'doc'):
            doc = Document(io.BytesIO(file_bytes))
            return '\n'.join(p.text for p in doc.paragraphs)
    except Exception as e:
        print(f"Extraction error: {e}")
        
    # fallback to plain text decode
    return file_bytes.decode('utf-8', errors='ignore')

def normalize_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def extract_keywords(texts: List[str], top_k: int = 20) -> List[str]:
    if not texts or not any(t.strip() for t in texts):
        return []
    try:
        vec = TfidfVectorizer(max_features=10000, stop_words='english')
        X = vec.fit_transform(texts)
        feature_names = vec.get_feature_names_out()
        
        import numpy as np
        scores = np.asarray(X.mean(axis=0)).ravel()
        top_idx = scores.argsort()[::-1][:top_k]
        return [feature_names[i] for i in top_idx]
    except Exception:
        return []

def extract_skills(text: str, top_k: int = 30) -> List[str]:
    # Since we removed the heavy spacy model, we'll use a combination of 
    # noun extraction and statistical keyword extraction
    nlp = _get_nlp()
    # Basic tokenization
    doc = nlp(text[:50000]) # Limit processing size for speed/memory
    
    # Simple candidates from noun chunks
    candidates = set()
    # spacy.blank('en') doesn't have noun_chunks without the 'parser' component
    # but we can use simple regex for common capitalized "skills" (proper nouns)
    
    # 1. Regex for Capitalized words (often skills/entities)
    # We look for Capitalized words or acronyms: React, SQL, AWS, AI
    potential_skills = re.findall(r"\b[A-Z][a-zA-Z0-9+#]*\b", text)
    for ps in potential_skills:
        if len(ps) > 1:
            candidates.add(ps)
            
    # 2. Statistical fallback
    keywords = extract_keywords([text], top_k=top_k)
    for kw in keywords:
        candidates.add(kw.title())
    
    # Clean and return
    from collections import Counter
    processed = [c.strip() for c in candidates if len(c.strip()) > 1]
    cnt = Counter(processed)
    return [k for k, _ in cnt.most_common(top_k)]

def extract_years_of_experience(text: str) -> float:
    years = 0.0
    # Pattern 1: "X years"
    m = re.findall(r"(\d+)\s+years", text, flags=re.I)
    if m:
        vals = [int(x) for x in m]
        years = max(vals)
    else:
        # Pattern 2: Date ranges like 2018-2021
        ranges = re.findall(r"(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}", text)
        if ranges:
            try:
                years_list = [int(b) - int(a) for a, b in ranges]
                years = sum(years_list) if years_list else 0.0
            except Exception:
                years = 0.0
    return float(years)
