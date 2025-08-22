# Zeraflink Monorepo

Monorepo for Zeraflink platform: API, Profile app, Dashboard app.

## Getting Started

1. Start Postgres:
```bash
docker compose up -d db
```

2. Copy env:
```bash
cp .env.example .env
```

3. Install deps and scaffold services:
```bash
pnpm install
```

