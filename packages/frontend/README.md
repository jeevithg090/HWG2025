# TechCollab Frontend

Next.js 15 (App Router) + Tailwind CSS + shadcn/ui frontend for the TechCollab platform:
freelance gigs, tech events and community chat.

## Getting started

```bash
cp .env.example .env.local   # adjust service URLs if needed
npm ci --legacy-peer-deps
npm run dev                  # http://localhost:3000
```

The backend services are expected at the URLs in `.env.example` (user `:4000`,
freelance `:4001`, events `:4002`). See [docs/API-INTEGRATION.md](docs/API-INTEGRATION.md).

## Scripts

| Script              | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start the dev server                      |
| `npm run build`     | Production build (`output: "standalone"`) |
| `npm start`         | Serve the production build                |
| `npm run lint`      | ESLint (Next core-web-vitals + TS rules)  |
| `npm run typecheck` | `tsc --noEmit`                            |
| `npm test`          | Vitest unit tests                         |
| `npm run format`    | Prettier (`format:check` to verify)       |

## Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:4000 \
  --build-arg NEXT_PUBLIC_FREELANCE_SERVICE_URL=http://localhost:4001 \
  --build-arg NEXT_PUBLIC_EVENT_SERVICE_URL=http://localhost:4002 \
  -t techcollab-frontend .
docker run -p 3000:3000 techcollab-frontend
```

## Deployment

Deploy as a Next.js `standalone` server with the Dockerfile, or to any Next.js host such as Vercel. Set the `NEXT_PUBLIC_*` variables **before** building, and add the site's origin to each backend's `CORS_ORIGIN`. See the [root README](../../README.md#deployment).
