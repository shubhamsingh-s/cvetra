from sentence_transformers import SentenceTransformer
import numpy as np

# Load once at startup — model downloads on first run (~90MB)
model = SentenceTransformer('all-MiniLM-L6-v2')

def embed(text: str) -> list[float]:
    vec = model.encode([text[:2000]])[0]  # truncate for speed
    return vec.tolist()

def cosine_similarity(a: list, b: list) -> float:
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
