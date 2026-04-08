# Frontend — Deployment & Vercel Quick Start

This folder contains the frontend app. Use the instructions below to run locally and deploy to Vercel.

Local development
- Copy `.env.example` to `.env.local` and adjust if needed:

```
NEXT_PUBLIC_API_URL=https://talentiq-backend-pyhf.onrender.com
```

- Install and run:

```bash
cd frontend
npm install
npm run dev
```

Vercel deployment (recommended)
1. Push your repo to GitHub.
2. In Vercel, import project and set **Root Directory** to `frontend`.
3. In Project Settings → Environment Variables add:
   - `NEXT_PUBLIC_API_URL` = `https://talentiq-backend-pyhf.onrender.com`
4. Deploy. Vercel auto-detects Next.js and runs the correct build.

Notes
- If you prefer proxying `/api` requests to the backend during production, a `vercel.json` rewrite is included. Remove it if you want the frontend to call the backend via `NEXT_PUBLIC_API_URL` directly.
- `NEXT_PUBLIC_*` variables are inlined at build time — set them in Vercel before building.

Troubleshooting
- Invalid `vercel.json`: ensure `vercel.json` is valid JSON and follows Vercel schema (or remove it to use defaults).
- CORS errors: configure backend CORS to allow your Vercel origin and credentials if using cookies.

That's it — once env vars are set, deploy and test the site.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
