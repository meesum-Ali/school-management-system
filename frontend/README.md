# Frontend Application (Next.js 16 App Router)

This frontend uses Next.js 16 (App Router) with React 18, TypeScript (strict), MUI 7, Tailwind, React Query, and a custom Auth provider.

## Architecture and standards

- App Router under `app/` with server/client components as appropriate
- Edge auth enforcement via `proxy.ts` (Next 16 replacement for `middleware.ts`)
- SSR-safe API client (`lib/api.ts`) using a browser-only token accessor (`lib/browser.ts`)
- Theming, Auth, and React Query providers are mounted in `app/layout.tsx`
- ESLint flat config with `eslint-config-next` and Prettier enforcing core web vitals and formatting

## Requirements and environment

Environment variables (client-safe need NEXT_PUBLIC_ prefix):

```
NEXT_PUBLIC_API_URL=<http://localhost:3000 or your backend>
NEXT_PUBLIC_ZITADEL_ISSUER=<issuer URL>
NEXT_PUBLIC_ZITADEL_CLIENT_ID=<client id>
NEXT_PUBLIC_ZITADEL_REDIRECT_URI=http://localhost:3001/auth/callback
```

## Getting started

```bash
cd frontend
npm install
npm run dev            # defaults to port 3000
# or specify a port
PORT=3001 npm run dev
```

Open http://localhost:3000 (or your chosen port).

## Available scripts

- `npm run dev` – Start Next dev server (Turbopack)
- `npm run build` – Production build
- `npm start` – Start production server
- `npm run lint` – Lint using ESLint with Next config

## Auth and routing

- `proxy.ts` protects routes by checking cookies for `token`/`id_token`, performs PKCE redirects to Zitadel when unauthenticated, validates expiry, and enforces roles for `/admin/*` (requires `SUPER_ADMIN` or `SCHOOL_ADMIN`).
- Public routes are allowed (e.g., `/unauthorized`, `/debug-token`, `/test-auth`).
- Client navigations should use `next/link` rather than `<a>` for in-app routes.

## SSR-safe API client

- `lib/api.ts` centralizes Axios with baseURL from `lib/config.ts`.
- Token is read via `lib/browser.ts` to avoid accessing `localStorage` on the server.

## Project structure (simplified)

```
frontend/
├── app/                    # App Router (layouts, pages, routes)
├── components/             # UI and feature components
├── hooks/                  # React Query hooks and helpers
├── lib/                    # axios api, config, browser helpers
├── public/                 # static assets
├── styles/                 # global styles, Tailwind
├── theme/                  # MUI theme
├── types/                  # DTOs and shared types
├── proxy.ts                # Edge proxy (auth)
├── next.config.js          # Next config (Turbopack root pinned)
└── eslint.config.mjs       # ESLint flat config (Next + Prettier)
```

## Upgrades and migration notes

- Migrated from `middleware.ts` to `proxy.ts` (Next 16).
- Moved viewport config from `metadata` to `export const viewport` in `app/layout.tsx`.
- Replaced `<a>` with `Link` in app pages for internal navigation.
- Enabled linting across all source folders; fixed formatting via Prettier.

## Deployment

```bash
npm run build
npm start
```

Vercel or any Node host is supported. Ensure the env vars above are set in your hosting environment.
