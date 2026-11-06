# MathSTEP Core Chatbot

The application backend is moving from Xano to Supabase. The existing XanoScript snapshot remains in the repository for reference and has not been pushed or modified in Xano.

## Architecture

```text
Next.js
  ├─ Supabase Auth through same-origin login/session routes
  └─ FastAPI through same-origin chat/history routes
       ├─ verifies Supabase access tokens
       ├─ routes learning intent and validates supported mathematics
       ├─ calls the configured OpenAI-compatible model provider
       └─ reads with user JWT + RLS and writes atomic turns with server-only service key

Supabase
  ├─ Auth
  ├─ PostgreSQL conversations/messages with Row Level Security
  └─ pgvector is available for a future approved RAG corpus
```

The browser stores Supabase access and refresh tokens only in HttpOnly cookies. FastAPI verifies the access token with Supabase Auth. History reads use the verified user token and RLS; the atomic write RPC uses a server-only Supabase service-role key after FastAPI has derived the user ID from the verified JWT. Never put a service-role key or model key in the frontend.

## Supabase CLI

The Supabase CLI is installed as a pinned frontend development dependency and `supabase/config.toml` is initialized. Run CLI commands from `frontend/` with the repository root as the CLI work directory:

```powershell
cd frontend
npm exec -- supabase --version
npm exec -- supabase start --workdir ..
```

`supabase start` needs Docker Desktop or another Docker-compatible runtime. Docker is not installed on the current machine, so local Supabase containers cannot start yet. You can instead create a Supabase hosted development project and apply the migration remotely:

```powershell
cd frontend
npm exec -- supabase login --workdir ..
npm exec -- supabase link --project-ref YOUR_PROJECT_REF --workdir ..
npm exec -- supabase db push --dry-run --remote --workdir ..
npm exec -- supabase db push --remote --yes --workdir ..
```

Review the dry-run before applying it. The migration creates only `conversations`, `messages`, their RLS policies, and the atomic `record_chat_turn` RPC. It does not import the Xano workspace or any Xano records. Supabase CLI v3 defaults database commands to local; `--remote` explicitly targets the linked hosted project.

## Local application setup

1. Create a Supabase project for development. In Auth settings, decide whether email confirmation is enabled; with confirmation enabled, users confirm their email before their first login.
2. Apply `supabase/migrations/20261105000000_mathstep_chat.sql` using the CLI steps above.
3. Copy `frontend/.env.example` to `frontend/.env.local`; set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `FASTAPI_BASE_URL=http://127.0.0.1:8000`.
4. Copy `server/.env.example` to `server/.env`; set the Supabase URL, publishable key, server-only service-role key, plus `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL` for the selected OpenAI-compatible provider.
5. Start FastAPI from `server/` using an execution method permitted by your Windows Application Control policy. If approved, run `python -m uvicorn mathstep.main:app --reload --host 127.0.0.1 --port 8000`; do not disable the policy.
6. Start Next.js from `frontend/`: `npm run dev`.

The model key belongs in `server/.env` for local development and in the FastAPI host's secret environment settings after deployment. Supabase Free currently has two free projects and can pause a project after a week of inactivity; use it for development and demos, and account for that behavior before relying on it for student production data. See [Supabase billing limits](https://supabase.com/docs/guides/platform/billing-on-supabase).

## Vercel deployment

Deploy this repository as two Vercel projects so the frontend and FastAPI backend can each use their own runtime:

- Frontend project root: `frontend` (Next.js).
- Backend project root: `server` (FastAPI; `server/index.py` exports the `app` entrypoint).

Set these variables in both Preview and Production environments:

- Frontend: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `FASTAPI_BASE_URL` set to the deployed backend's HTTPS URL.
- Backend: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AI_BASE_URL`, `AI_API_KEY`, and `AI_MODEL`.

Keep `SUPABASE_SERVICE_ROLE_KEY` and `AI_API_KEY` only in the backend project's encrypted environment variables. Do not copy them into the frontend project. The two projects can be created from the same Git repository with different Root Directory settings. Deploy a Preview first, verify `/health`, sign-in, and chat, then deploy Production.

## Current implementation scope

- Three approved MathSTEP modules and eight learning stages.
- Supabase email/password login, optional sign-up, HttpOnly sessions, and refresh-token handling.
- Authenticated FastAPI chat, intent routing, hint ladder, assessment guard, and restricted deterministic math validation.
- Durable conversations/messages using a transactional database function and per-user RLS policies.
- OpenAI-compatible provider configuration kept on the Python server.
- No approved MathSTEP knowledge corpus is connected; RAG, citations, document ingestion, and embeddings are not simulated.
- The hosted Supabase development project is configured in ignored local environment files, and the initial conversation/message migration has been applied through Supabase MCP. Both tables have RLS enabled. Local Supabase containers have not been started because Docker is unavailable.
- The local FastAPI environment has Supabase service-role and Gemini settings. They are excluded from Git. Copy backend values into Vercel's encrypted environment settings before deploying the backend; never add server keys to the frontend project.
