# Frontend–Backend Integration

The frontend talks to three backend services. Their base URLs are configured in
one place, `lib/config.ts`, from these build-time variables (see `.env.example`):

| Service           | Variable                            | Default                 |
| ----------------- | ----------------------------------- | ----------------------- |
| User service      | `NEXT_PUBLIC_USER_SERVICE_URL`      | `http://localhost:4000` |
| Freelance service | `NEXT_PUBLIC_FREELANCE_SERVICE_URL` | `http://localhost:4001` |
| Event service     | `NEXT_PUBLIC_EVENT_SERVICE_URL`     | `http://localhost:4002` |

`NEXT_PUBLIC_*` values are inlined at build time, so rebuild after changing them
(the Dockerfile accepts them as build args).

## API client (`lib/api-client.ts`)

- `userApi`: `signup`, `login`, `getUserProfile`, `updateProfile`
- `freelanceApi`: gigs, gig search, proposals, reviews, client/freelancer dashboards
- `eventApi`: events CRUD, register/cancel, attendees, mark attendance, a user's registrations

Every call resolves (never throws) to either
`{ success: true, status, ...body }` — the service's own success payload, e.g.
`result.data` for the freelance service or `result.events` / `result.event` for the
event service — or `{ success: false, status, message, errors? }`.
`status === 0` means the request never reached the server.

Writes (POST/PUT/PATCH/DELETE) and other protected endpoints are sent with
`Authorization: Bearer <token>`; when no token is stored the client returns a
401 result without calling the service. The services derive the acting user
(`clientId`, `freelancerId`, `reviewerId`, `organizerId`, attendee id/email) from
the token, so the frontend does not send those ids.

Validation errors (`{ message: "VALIDATION_ERROR", errors: [{ path, message }] }`)
are turned into a readable message.

## Authentication

- `lib/auth-context.tsx` stores the JWT and user in `localStorage`
  (`lib/auth-utils.ts`) after login.
- On load it validates the stored session with `GET /user/profile`. The session is
  cleared only on a 401; network or server errors keep the cached session.
- `lib/user-context.tsx` derives the dashboard view of the user (role flags such as
  `canPostGigs`) from the auth context.

## Notes

- The community chat (`lib/chat-context.tsx`) is a client-side demo with mock data;
  there is no chat service yet.
- Run the unit tests with `npm test`.
