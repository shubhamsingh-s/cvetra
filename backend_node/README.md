Node.js backend (MongoDB + Mongoose)

Quick start (local):

1. Install dependencies

```bash
cd backend_node
npm install
```

2. Create `.env` from `.env.example` and set `MONGO_URI` and `JWT_SECRET`.

3. Run server

```bash
npm run dev
```

4. Run DB smoke tests

```bash
npm run test-db
```

This service exposes:
- `POST /api/auth/register`, `POST /api/auth/login`
- `POST /api/jobs`, `GET /api/jobs`
- `POST /api/resumes/upload-resume`, `POST /api/resumes/analyze-resume`
- `POST /api/matches`, `GET /api/matches/ranking`
- `GET /health`
