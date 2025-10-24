# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Progressive Web App (PWA) for university students to manage habits and study planning. Built with a FastAPI backend and React frontend, fully containerized with Docker Compose.

**Tech Stack:**
- **Backend:** FastAPI (Python), SQLModel ORM, PostgreSQL, JWT auth, Alembic migrations
- **Frontend:** React 19, TypeScript, Vite, TanStack Query/Router, Chakra UI
- **Infrastructure:** Docker Compose, Traefik proxy, GitHub Actions CI/CD

## Development Commands

### Docker Compose Development (Recommended)

Start the full stack with live reload:
```bash
docker compose watch
```

Stop specific service to run locally:
```bash
docker compose stop backend  # or frontend
```

View logs:
```bash
docker compose logs          # all services
docker compose logs backend  # specific service
```

### Backend Development

**Location:** `./backend/`

**Local setup:**
```bash
cd backend
uv sync                      # Install dependencies
source .venv/bin/activate    # Activate venv
```

**Run locally (instead of Docker):**
```bash
cd backend
fastapi dev app/main.py      # Dev server with reload
```

**Run tests:**
```bash
bash ./scripts/test.sh                              # Full test suite with Docker
docker compose exec backend bash scripts/tests-start.sh  # Tests on running stack
docker compose exec backend bash scripts/tests-start.sh -x  # Stop on first error
```

Test coverage report: `htmlcov/index.html`

**Database migrations:**
```bash
docker compose exec backend bash
alembic revision --autogenerate -m "Description"  # Create migration
alembic upgrade head                               # Apply migration
```

**Frontend client generation:**
```bash
./scripts/generate-client.sh  # Auto-generates TypeScript client from OpenAPI
```

### Frontend Development

**Location:** `./frontend/`

**Local setup:**
```bash
cd frontend
fnm install  # or nvm install
fnm use      # or nvm use
npm install
```

**Run locally (instead of Docker):**
```bash
cd frontend
npm run dev              # Dev server at http://localhost:5173
```

**Other commands:**
```bash
npm run build            # Production build
npm run lint             # Biome linter
npm run generate-client  # Generate API client (manual)
npx playwright test      # E2E tests
npx playwright test --ui # E2E tests with UI
```

### Running Single Test

**Backend:**
```bash
docker compose exec backend bash
pytest tests/path/to/test_file.py::test_function_name -v
```

**Frontend:**
```bash
npx playwright test tests/path/to/test.spec.ts
```

## Architecture

### Backend Structure

```
backend/app/
├── main.py           # FastAPI app initialization, CORS, Sentry
├── models.py         # SQLModel models (User, Item, + request/response schemas)
├── crud.py           # Database operations
├── utils.py          # Email sending, token generation
├── api/
│   ├── main.py       # API router aggregation
│   ├── deps.py       # Dependencies (auth, DB session)
│   └── routes/       # Endpoint modules (users, items, login, etc.)
├── core/
│   ├── config.py     # Settings from environment variables
│   ├── db.py         # Database engine and session
│   └── security.py   # Password hashing, JWT verification
└── alembic/          # Database migrations
```

**Key patterns:**
- Models are in `models.py` using SQLModel (combined Pydantic + SQLAlchemy)
- API endpoints in `api/routes/` are organized by resource
- Dependencies in `api/deps.py` provide DB sessions and current user
- Settings loaded via Pydantic Settings from `.env` file
- Authentication uses JWT tokens with Bearer scheme

### Frontend Structure

```
frontend/src/
├── main.tsx          # App entry point, TanStack Router setup
├── routes/           # File-based routing (TanStack Router)
├── components/       # Reusable UI components
├── client/           # Auto-generated OpenAPI client (DO NOT EDIT)
├── hooks/            # Custom React hooks
├── theme/            # Chakra UI theming
└── utils.ts          # Utility functions
```

**Key patterns:**
- File-based routing with TanStack Router (routes auto-generated to `routeTree.gen.ts`)
- API calls use auto-generated client from backend OpenAPI spec
- TanStack Query manages server state and caching
- Chakra UI components with custom theme supporting dark mode
- `client/` directory is auto-generated - regenerate after backend API changes

### Docker Architecture

- **Development:** `docker-compose.yml` + `docker-compose.override.yml` with volume mounts for live reload
- **Services:** db (PostgreSQL), backend, frontend, adminer, traefik (proxy), prestart (migrations)
- **Networking:** Uses `traefik-public` network for routing, internal default network
- **Domains:** Local dev uses `localhost` with ports, optionally `localhost.tiangolo.com` for subdomain testing

## Development URLs

**Standard (ports):**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Adminer: http://localhost:8080
- Traefik UI: http://localhost:8090

**With `localhost.tiangolo.com` (subdomains):**
- Frontend: http://dashboard.localhost.tiangolo.com
- Backend API: http://api.localhost.tiangolo.com

Set `DOMAIN=localhost.tiangolo.com` in `.env` to use subdomain mode.

## Important Notes

- Always update frontend client after backend API changes: `./scripts/generate-client.sh`
- Database migrations are required for model changes - don't skip them
- The `client/` directory in frontend is auto-generated - never edit manually
- Backend virtual environment is at `backend/.venv/bin/python`
- Pre-commit hooks available (install with `uv run pre-commit install`)
- Environment variables configured in `.env` file at root
- Backend uses `uv` for dependency management, frontend uses `npm`
- Alembic auto-generates migrations but review them before applying
