FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT=8001
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "ai-engine.main:app", "-b", "0.0.0.0:8001", "--workers", "1"]
