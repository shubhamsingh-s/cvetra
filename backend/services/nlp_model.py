import os
from typing import List
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(MODELS_DIR, exist_ok=True)
MODEL_PATH = os.path.join(MODELS_DIR, 'nlp_model.joblib')


def train(texts: List[str], labels: List[str]):
    """Train a simple TF-IDF + LogisticRegression model and save it."""
    vec = TfidfVectorizer(max_features=10000)
    X = vec.fit_transform(texts)
    clf = LogisticRegression(max_iter=1000)
    clf.fit(X, labels)
    joblib.dump({'vectorizer': vec, 'model': clf}, MODEL_PATH)
    return {'status': 'ok', 'model_path': MODEL_PATH}


def load_model():
    if not os.path.exists(MODEL_PATH):
        return None
    return joblib.load(MODEL_PATH)


def predict(text: str):
    """Predict label for a single text. Returns label and optional probabilities."""
    data = load_model()
    if not data:
        return {'error': 'model_not_trained'}
    vec = data['vectorizer']
    clf = data['model']
    X = vec.transform([text])
    pred = clf.predict(X)[0]
    proba = None
    if hasattr(clf, 'predict_proba'):
        proba = clf.predict_proba(X).tolist()[0]
    return {'prediction': pred, 'probability': proba}
