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
        try:
            _nlp = spacy.load('en_core_web_sm')
        except Exception:
            # Fall back to blank English model if core model not available
            _nlp = spacy.blank('en')
    return _nlp

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    ext = filename.lower().split('.')[-1]
    if ext == 'pdf':
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            return '\n'.join(p.extract_text() or '' for p in pdf.pages)
    elif ext in ('docx', 'doc'):
        doc = Document(io.BytesIO(file_bytes))
        return '\n'.join(p.text for p in doc.paragraphs)
    else:
        # treat as plain text
        return file_bytes.decode('utf-8', errors='ignore')

def normalize_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def extract_keywords(texts: List[str], top_k: int = 20) -> List[str]:
    vec = TfidfVectorizer(max_features=10000, stop_words='english')
    X = vec.fit_transform(texts)
    feature_names = vec.get_feature_names_out()
    # average tf-idf across documents
    import numpy as np
    scores = np.asarray(X.mean(axis=0)).ravel()
    top_idx = scores.argsort()[::-1][:top_k]
    return [feature_names[i] for i in top_idx]

def extract_skills(text: str, top_k: int = 30) -> List[str]:
    nlp = _get_nlp()
    doc = nlp(text[:200000])
    # candidates: noun chunks and named entities
    candidates = set()
    for ent in doc.ents:
        if ent.label_ in ('ORG', 'PERSON', 'PRODUCT', 'NORP', 'CARDINAL'):
            continue
        candidates.add(ent.text.lower())
    for nc in doc.noun_chunks:
        if len(nc.text) > 1 and len(nc.text) < 60:
            candidates.add(nc.text.lower())
    # fallback to keyword extraction if too few
    if len(candidates) < 5:
        keywords = extract_keywords([text], top_k=top_k)
        return keywords
    # clean and return most frequent
    from collections import Counter
    cnt = Counter([c.strip() for c in candidates if len(c.strip()) > 1])
    return [k for k, _ in cnt.most_common(top_k)]

def extract_years_of_experience(text: str) -> float:
    # simple heuristic: look for patterns like "X years" or date ranges
    years = 0.0
    m = re.findall(r"(\d+)\s+years", text, flags=re.I)
    if m:
        vals = [int(x) for x in m]
        years = max(vals)
    else:
        # look for date ranges like 2018-2021
        ranges = re.findall(r"(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}", text)
        if ranges:
            try:
                years = max(int(b) - int(a) for a, b in [(r[0]+"00", r[1]+"00") for r in ranges])
            except Exception:
                years = 0.0
    return float(years)
