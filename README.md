# Yarijoo Platform V2

یاری‌جو نسخه ۲ — پلتفرم جامع روانشناسی و سلامت روان

A full-stack mental health platform built with **NestJS + Fastify** (backend), **Next.js 15 App Router** (frontend), **PostgreSQL 16**, **Redis 7**, and **MinIO** object storage.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start (Development)](#quick-start-development)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [API Base URL](#api-base-url)
- [Useful Commands](#useful-commands)
- [Migration from Legacy System](#migration-from-legacy-system)

---

## Architecture Overview

```
                    ┌─────────────────────────────────┐
                    │        Nginx (prod only)         │
                    │  SSL · Gzip · Static caching     │
                    │   :80 → :443                     │
                    └──────────┬──────────────┬────────┘
                               │              │
                    ┌──────────▼───┐  ┌───────▼──────────┐
                    │  NestJS API  │  │  Next.js 15 SSR   │
                    │  Fastify     │  │  App Router / RTL │
                    │  :3000       │  │  :3001            │
                    └──────┬───────┘  └──────────────────┘
                           │
          ┌────────────────┼──────────────────┐
          │                │                  │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌───────▼──────┐
   │ PostgreSQL  │  │   Redis 7   │  │    MinIO      │
   │ 16 (Primary)│  │ Cache+Queue │  │ Object Store  │
   └─────────────┘  └─────────────┘  └──────────────┘
```

For the full Mermaid diagram see [`design.md`](.kiro/specs/yarijoo-platform-v2/design.md).

---

## Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Docker | 24.x | Engine |
| Docker Compose | v2.20 | Bundled with Docker Desktop |
| Node.js | 20 LTS | For local development outside Docker |
| npm | 10.x | Bundled with Node 20 |

> **Note (فارسی):** برای اجرای محلی (بدون Docker) نیاز به نصب PostgreSQL 16 و Redis 7 به‌صورت جداگانه دارید.

---

## Quick Start (Development)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/yarijoo-v2.git
cd yarijoo-v2

# 2. Create your environment file
cp .env.example .env
# Then open .env and fill in the required values (see table below)

# 3. Start all services
docker compose up -d

# 4. Run database migrations
docker compose exec backend npx prisma migrate deploy

# 5. Open the application
#    Frontend:     http://localhost:3001
#    Backend API:  http://localhost:3000/api/v1
#    MinIO UI:     http://localhost:9001
```

All services start with health checks. The backend waits for Postgres, Redis, and MinIO to be healthy before starting.

---

## Production Deployment

```bash
# 1. Place SSL certificates
mkdir -p nginx/ssl
cp /path/to/fullchain.pem nginx/ssl/
cp /path/to/privkey.pem   nginx/ssl/

# 2. Set production environment variables in .env
#    Make sure NODE_ENV=production and DOMAIN is set

# 3. Build and start all services with the production override
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 4. Run database migrations
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  exec backend npx prisma migrate deploy
```

In production the `runner` stages of each Dockerfile are used:
- **Backend**: multi-stage `builder → runner`, non-root user, production-only `node_modules`
- **Frontend**: multi-stage `deps → builder → runner`, Next.js **standalone** output

> **Note (فارسی):** در محیط Production پورت‌های Postgres و Redis از خارج Docker در دسترس نیستند. Nginx تنها نقطه ورود است.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values marked `CHANGE_ME`.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | `development` \| `production` \| `test` |
| `FRONTEND_URL` | No | `http://localhost:3001` | Public URL of the frontend (used for CORS) |
| `BACKEND_URL` | No | `http://localhost:3000` | Public URL of the API (used by frontend) |
| `DATABASE_URL` | **Yes** | — | Full Prisma connection string. Format: `postgresql://USER:PASS@HOST:PORT/DB` |
| `POSTGRES_DB` | **Yes** | `yarijoo` | Database name (docker-compose) |
| `POSTGRES_USER` | **Yes** | `yarijoo` | Database user (docker-compose) |
| `DB_PASSWORD` | **Yes** | — | Database password |
| `REDIS_URL` | **Yes** | — | Full Redis URL. Format: `redis://:PASS@HOST:6379` |
| `REDIS_PASSWORD` | **Yes** | — | Redis AUTH password (must match `REDIS_URL`) |
| `MINIO_ENDPOINT` | **Yes** | `http://localhost:9000` | MinIO S3 API endpoint |
| `MINIO_ACCESS_KEY` | **Yes** | — | MinIO root user / access key |
| `MINIO_SECRET_KEY` | **Yes** | — | MinIO root password / secret key (min 8 chars) |
| `MINIO_BUCKET` | No | `yarijoo-files` | Default bucket for uploads |
| `JWT_SECRET` | **Yes** | — | Secret for signing access tokens (min 32 chars) |
| `REFRESH_SECRET` | **Yes** | — | Secret for signing refresh tokens (must differ from `JWT_SECRET`) |
| `JWT_EXPIRES_IN` | No | `15m` | Access token lifetime |
| `REFRESH_EXPIRES_IN` | No | `7d` | Refresh token lifetime |
| `KAVENEGAR_API_KEY` | **Yes** | — | API key from Kavenegar SMS dashboard |
| `ZARINPAL_MERCHANT_ID` | **Yes** | — | Zarinpal merchant ID (36-char UUID) |
| `OPENAI_API_KEY` | **Yes** | — | OpenAI API key for GPT-4 powered AI insights |
| `DOMAIN` | Prod only | `yarijoo.ir` | Domain used by Nginx config (production) |

> **Security note:** Never commit `.env` to version control. The `.gitignore` already excludes it.

---

## Database Migrations

Migrations are managed with [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate).

```bash
# Development — create a new migration after editing schema.prisma
docker compose exec backend npx prisma migrate dev --name <migration_name>

# Apply all pending migrations (production / CI)
docker compose exec backend npx prisma migrate deploy

# Open Prisma Studio (database browser)
docker compose exec backend npx prisma studio

# Reset the database (destroys all data — development only!)
docker compose exec backend npx prisma migrate reset
```

The Prisma schema is located at `backend/prisma/schema.prisma`.  
Migration files are stored in `backend/prisma/migrations/`.

---

## API Base URL

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:3000/api/v1` |
| Production  | `https://<your-domain>/api/v1` |

All endpoints require `Authorization: Bearer <access_token>` unless marked as public.

Key public endpoints:
```
POST /api/v1/auth/send-otp     # Send OTP to mobile number
POST /api/v1/auth/verify-otp   # Verify OTP, receive JWT
GET  /api/v1/tests             # List psychological tests
GET  /api/v1/blog              # List blog articles
GET  /api/v1/shop/products     # List shop products
```

---

## Useful Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart a single service
docker compose restart backend

# Enter a running container
docker compose exec backend sh
docker compose exec frontend sh

# Run backend tests
docker compose exec backend npm test

# Lint frontend
docker compose exec frontend npm run lint

# Generate Prisma client (after schema changes)
docker compose exec backend npx prisma generate
```

---

## Migration from Legacy System

The legacy system runs on **Laravel / MySQL**. Migration is handled by the `MigrationModule` inside the backend.

### Steps

```bash
# 1. Place the MySQL dump next to the project root
#    Expected path: ../odtjonaf_yarijoo(11).sql

# 2. Configure legacy DB connection in .env
#    LEGACY_MYSQL_URL=mysql://user:pass@host:3306/legacy_db
#    (or use MIGRATION_SOURCE_FILE for file-based import)

# 3. Run the migration via the admin API
curl -X POST http://localhost:3000/api/v1/admin/migration/run \
  -H "Authorization: Bearer <admin_token>"

# 4. Check migration status
curl http://localhost:3000/api/v1/admin/migration/status \
  -H "Authorization: Bearer <admin_token>"
```

### What gets migrated

| Source (MySQL) | Target (PostgreSQL) | Notes |
|----------------|---------------------|-------|
| `users` | `users` | Passwords (bcrypt), roles preserved |
| `xxx_questions` tables | `test_questions` (Unified Schema) | 150+ tests |
| `xxx_results` tables | `test_interpretations` | Score ranges mapped |
| `user_test_results` | `user_test_attempts` | Historical scores |
| `posts` / `articles` | `blog_posts` | UTF-8 conversion |
| `books` | `books` | Cover images re-uploaded to MinIO |
| `orders` / `order_items` | `orders` / `order_items` | Referential integrity validated |
| `consultations` | `appointments` | Status mapping applied |

> **Note (فارسی):** تمام فیلدهای متنی از `utf8mb3` MySQL به `UTF-8` کامل PostgreSQL تبدیل می‌شوند. رکوردهای ناموفق در فایل لاگ مایگریشن ثبت می‌شوند و مایگریشن ادامه می‌یابد.

---

## Project Structure

```
yarijoo-v2/
├── backend/                # NestJS + Fastify API
│   ├── src/
│   │   ├── modules/        # Feature modules (auth, test, blog, shop …)
│   │   ├── common/         # Guards, interceptors, decorators
│   │   ├── config/         # Configuration service
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── Dockerfile
│
├── frontend/               # Next.js 15 App Router (RTL/Persian)
│   ├── src/
│   │   ├── app/            # Routes (public, auth, user, admin)
│   │   ├── components/     # UI design system + feature components
│   │   ├── stores/         # Zustand stores
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # API client, utilities
│   └── Dockerfile
│
├── shared/                 # TypeScript types shared by FE and BE
│
├── nginx/
│   ├── nginx.conf          # Production Nginx config
│   └── ssl/                # SSL certificates (not committed)
│
├── docker-compose.yml      # Development stack
├── docker-compose.prod.yml # Production overrides (+ Nginx)
├── .env.example            # Environment variable template
└── README.md
```
