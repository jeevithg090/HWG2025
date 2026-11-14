# TechCollab

**One platform for tech freelancing, events and community.**

Startups, developers and tech communities usually juggle a freelancing
marketplace, an event platform and a chat app. TechCollab brings them together:
clients post gigs and hire freelancers, organizers run hackathons, meetups and
webinars, and members collaborate in community spaces. It started as a
hackathon project ([original brief](docs/problem-statement.md)).

## Features

**Freelancing** (`freelance-service`)

- Clients and startups post gigs with budget, required skills and deadline
- Full-text and skill search with pagination
- Freelancers submit proposals (cover letter, bid, timeline), then edit or
  withdraw them while they are still pending
- Gig owners accept or reject proposals. Accepting one starts the gig and
  rejects the other bids
- After a gig is completed, the client and the hired freelancer can review
  each other (1–5 stars), once each
- Dashboards for clients and freelancers, plus platform stats for admins

**Events** (`event-service`)

- Create hackathons, meetups, webinars, conferences and workshops, with a
  venue or an online link, capacity, tags and a cover image
- Draft or published events. Drafts are visible only to their organizer
- Registration with capacity limits and an automatic waitlist. Waitlisted
  users are promoted when a seat frees up or capacity is raised
- Organizer tools: attendee list and attendance check-in

**Accounts** (`user-service`)

- Email/password sign-up as a freelancer, client or startup, with bcrypt
  password hashing
- JWT sign-in. The other services verify the same token, so no
  service-to-service call is needed per request
- Profile endpoint for restoring sessions and editing your bio and skills

**Web app** (`frontend`)

- Next.js App Router UI with a landing page, auth flows and a dashboard for
  freelancing, events and community
- Dark and light themes, responsive layout, shadcn/ui components

> **Community chat status:** the community and chat screens in the frontend
> currently run on client-side demo data (`lib/chat-context.tsx`). No backend
> chat or WebSocket service exists yet. See [Roadmap](#roadmap).

## Tech stack

| Layer     | Technology                                                    |
| --------- | ------------------------------------------------------------- |
| Frontend  | Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui    |
| Backend   | Node.js 20, Express 5, TypeScript, Zod validation             |
| Database  | PostgreSQL 16 via TypeORM                                     |
| Auth      | JWT (`jsonwebtoken`), bcrypt                                  |
| Tooling   | ESLint 9, Prettier, Jest + Supertest, Vitest                  |
| Packaging | Multi-stage Dockerfiles per service, Docker Compose           |

## Architecture

```
                         ┌──────────────────────────┐
                         │  frontend (Next.js) :3000│
                         └──────┬─────────┬─────────┘
               Bearer JWT       │         │        │
          ┌─────────────────────┘         │        └──────────────────────┐
          ▼                               ▼                               ▼
┌───────────────────┐        ┌──────────────────────┐        ┌───────────────────┐
│ user-service :4000│        │freelance-service:4001│        │event-service :4002│
│ signup / login    │        │ gigs, proposals,     │        │ events, attendees,│
│ issues JWTs       │        │ reviews, dashboards  │        │ waitlist          │
└─────────┬─────────┘        └──────────┬───────────┘        └─────────┬─────────┘
          │      all three verify tokens with the shared JWT_SECRET     │
          └──────────────────────────────┼──────────────────────────────┘
                                         ▼
                                ┌─────────────────┐
                                │  PostgreSQL 16  │
                                └─────────────────┘
```

- **Independent services.** Each backend is its own npm package with its own
  Dockerfile, so you can deploy and scale them separately. They share one
  Postgres database but use separate tables.
- **Stateless auth.** `user-service` signs a JWT holding `{ id, name, email,
  type }`. The other services check the signature locally with the same
  `JWT_SECRET` and take the caller's identity from the token, never from the
  request body.
- **Layering inside each service:** `routes` (HTTP and Zod validation) →
  `services` (business rules and authorization) → `repository` (TypeORM data
  access behind an interface). The tests swap in in-memory repositories, so
  the business rules are tested without a database.
- **Consistent errors.** Every service returns
  `{ success: false, message: "<CODE>" }` with a matching HTTP status.
  Validation failures return `400` with a field-level `errors` array.

## Getting started

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 14+ (or Docker)

### Option A: Docker Compose (everything)

```bash
cp .env.example .env          # then set POSTGRES_PASSWORD and JWT_SECRET
docker compose up --build
```

| URL                   | What              |
| --------------------- | ----------------- |
| http://localhost:3000 | Web app           |
| http://localhost:4000 | user-service      |
| http://localhost:4001 | freelance-service |
| http://localhost:4002 | event-service     |
| localhost:5433        | Postgres (host)   |

Tables are created automatically on first start (`DB_SYNCHRONIZE=true`).

### Option B: run locally

```bash
# 1. Database
createdb techcollab              # or: docker compose up -d postgres

# 2. Install dependencies for every package
npm run install:all

# 3. Configure each service (edit DB credentials and use one JWT_SECRET everywhere)
for s in user-service freelance-service event-service; do
  cp packages/$s/.env.example packages/$s/.env
done
cp packages/frontend/.env.example packages/frontend/.env.local

# 4. Start the services (one terminal each)
npm --prefix packages/user-service run dev
npm --prefix packages/freelance-service run dev
npm --prefix packages/event-service run dev
npm --prefix packages/frontend run dev
```

## Environment variables

Backend services (see `packages/<service>/.env.example`):

| Variable         | Default                 | Description                                                   |
| ---------------- | ----------------------- | ------------------------------------------------------------- |
| `PORT`           | 4000 / 4001 / 4002      | HTTP port                                                     |
| `JWT_SECRET`     | — **required**          | Secret for signing and verifying tokens; same in all services |
| `DB_HOST`        | `localhost`             | Postgres host                                                 |
| `DB_PORT`        | `5432`                  | Postgres port                                                 |
| `DB_USERNAME`    | `postgres`              | Postgres user                                                 |
| `DB_PASSWORD`    | _(empty)_               | Postgres password                                             |
| `DB_DATABASE`    | `techcollab`            | Database name                                                 |
| `DB_SYNCHRONIZE` | `true`                  | Auto-create/update tables from entities                       |
| `DB_LOGGING`     | `false`                 | Log SQL queries                                               |
| `CORS_ORIGIN`    | `http://localhost:3000` | Comma-separated browser origins allowed to call the API       |
| `LOG_LEVEL`      | `info`                  | Winston log level (JSON logs when `NODE_ENV=production`)      |
| `JWT_EXPIRES_IN` | `1h`                    | _user-service only:_ token lifetime                           |
| `BCRYPT_ROUNDS`  | `10`                    | _user-service only:_ password hashing cost                    |

Frontend (`packages/frontend/.env.example`). These values are baked into the
build:

| Variable                            | Default                 |
| ----------------------------------- | ----------------------- |
| `NEXT_PUBLIC_USER_SERVICE_URL`      | `http://localhost:4000` |
| `NEXT_PUBLIC_FREELANCE_SERVICE_URL` | `http://localhost:4001` |
| `NEXT_PUBLIC_EVENT_SERVICE_URL`     | `http://localhost:4002` |

Docker Compose reads the root `.env` (see `.env.example`):
`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET`,
`JWT_EXPIRES_IN`, `CORS_ORIGIN` and the three `NEXT_PUBLIC_*` URLs.

## Scripts

From the repository root (each runs in every package, in order):

```bash
npm run install:all    # npm ci everywhere
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm test               # Jest (backends) and Vitest (frontend)
npm run build          # compile backends, production Next.js build
npm run format:check   # Prettier
```

Inside a package: `npm run dev`, `npm run build`, `npm start`, `npm test`,
`npm run lint`, `npm run format`.

## API overview

All responses are JSON. 🔒 means `Authorization: Bearer <token>` is required.

<details>
<summary><strong>user-service</strong> (:4000)</summary>

| Method | Path                 | Description                                                  |
| ------ | -------------------- | ------------------------------------------------------------ |
| POST   | `/user/signup`       | `{ name, email, password, type? }` → `201 { success, user }` |
| POST   | `/user/login`        | `{ email, password }` → `{ success, token, user }`           |
| GET    | `/user/profile` 🔒   | Current user's profile                                       |
| PATCH  | `/user/profile` 🔒   | Update `name`, `bio`, `skills`                               |
| GET    | `/auth/verify-token` 🔒 | Decode and verify a token                                 |
| GET    | `/health`            | Liveness check                                               |

`type` is one of `freelancer` (default), `client` or `startup`. Admin
accounts cannot be created through sign-up.

</details>

<details>
<summary><strong>freelance-service</strong> (:4001)</summary>

| Method | Path                                  | Who                                  |
| ------ | ------------------------------------- | ------------------------------------ |
| GET    | `/gigs?page&limit&status`             | Public                               |
| GET    | `/gigs/search?query&skills=a,b`       | Public                               |
| GET    | `/gigs/:id`, `/gigs/client/:clientId` | Public                               |
| POST   | `/gigs` 🔒                            | Clients, startups, admins            |
| PUT    | `/gigs/:id` 🔒, DELETE `/gigs/:id` 🔒 | Gig owner or admin                   |
| POST   | `/proposals` 🔒                       | Any user except the gig owner        |
| GET    | `/proposals/gig/:gigId` 🔒            | Gig owner or admin                   |
| GET    | `/proposals/freelancer/:id` 🔒        | That freelancer or admin             |
| GET    | `/proposals/:id` 🔒                   | Author, gig owner or admin           |
| PUT    | `/proposals/:id` 🔒                   | Author edits/withdraws; owner accepts/rejects |
| DELETE | `/proposals/:id` 🔒                   | Author or admin                      |
| GET    | `/reviews`, `/reviews/:id`, `/reviews/gig/:gigId`, `/reviews/reviewer/:id`, `/reviews/reviewee/:id` | Public |
| POST   | `/reviews` 🔒                         | Client or hired freelancer of a completed gig |
| DELETE | `/reviews/:id` 🔒                     | Review author or admin               |
| GET    | `/dashboard/client/:id` 🔒, `/dashboard/freelancer/:id` 🔒 | That user or admin |
| GET    | `/dashboard/admin/stats` 🔒           | Admin                                |

</details>

<details>
<summary><strong>event-service</strong> (:4002)</summary>

| Method | Path                                           | Who                         |
| ------ | ---------------------------------------------- | --------------------------- |
| GET    | `/events?eventType&upcoming&organizerId&page&limit` | Public (drafts only for their organizer) |
| GET    | `/events/:id`                                  | Public if published         |
| POST   | `/events` 🔒                                   | Any signed-in user          |
| PUT    | `/events/:id` 🔒, DELETE `/events/:id` 🔒      | Organizer or admin          |
| POST   | `/events/:id/register` 🔒                      | Signed-in user              |
| POST   | `/events/:id/cancel` 🔒                        | The registered user         |
| GET    | `/events/:id/attendees` 🔒                     | Organizer or admin          |
| POST   | `/events/attendees/:attendeeId/mark-attendance` 🔒 | Organizer or admin      |
| GET    | `/events/user/:userId` 🔒                      | That user or admin          |

</details>

## Testing

- **Backends:** Jest + Supertest exercise each service's real Express app,
  routing, validation, auth and business rules against in-memory
  repositories, so no database is needed (`npm test` in each package).
- **Frontend:** Vitest unit tests cover the API client, auth storage and
  dashboard helpers.

## Deployment

- **Backends.** Each service has a multi-stage `Dockerfile` (Node 20 Alpine,
  production dependencies only, non-root user, `HEALTHCHECK` on `/health`).
  Deploy them to any container host (Render, Railway, Fly.io, ECS, Kubernetes)
  with the environment variables above. Give every service the same
  `JWT_SECRET`.
- **Frontend.** Builds as a Next.js `standalone` server (Docker) or deploys
  to Vercel. Set the `NEXT_PUBLIC_*` URLs to the public API addresses
  **before** building, and add the frontend's origin to each service's
  `CORS_ORIGIN`.
- **Database.** In production, set `DB_SYNCHRONIZE=false` once you manage the
  schema with TypeORM migrations, so that entity changes cannot alter tables
  unexpectedly.

## Project structure

```
.
├── docker-compose.yml          # Postgres + 3 APIs + web app
├── .env.example                # Compose configuration template
├── package.json                # Root scripts that run in every package
├── scripts/each-package.mjs
├── docs/problem-statement.md   # Original hackathon brief
└── packages/
    ├── user-service/           # Accounts and JWT issuing
    ├── freelance-service/      # Gigs, proposals, reviews, dashboards
    ├── event-service/          # Events, registration, waitlist
    │   ├── src/
    │   │   ├── app.ts          # Express app factory (dependency-injected)
    │   │   ├── server.ts       # DB connect, listen, graceful shutdown
    │   │   ├── config/         # Env parsing
    │   │   ├── common/         # Logger, AppError + error handler
    │   │   ├── middleware/     # JWT auth
    │   │   ├── models/         # TypeORM entities
    │   │   ├── repository/     # Repository interfaces + TypeORM impl
    │   │   ├── services/       # Business rules and authorization
    │   │   ├── routes/         # HTTP handlers
    │   │   └── validations/    # Zod schemas
    │   └── tests/              # Jest + Supertest
    └── frontend/               # Next.js web app
        ├── app/                # App Router pages
        ├── components/         # UI (shadcn/ui in components/ui)
        └── lib/                # API client, auth, contexts, helpers
```

## Roadmap

- Real-time community chat backend (Socket.IO or similar) to replace the
  frontend demo data
- TypeORM migrations instead of schema synchronization
- Transactions or row locks around event registration, so capacity holds
  under concurrent sign-ups
- Payments, event reminder emails and gig recommendations (bonus items from
  the original brief)
