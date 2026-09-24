# Trustos — frontend interface preview

A responsive financial-security product interface using the official LinuxBoss logo supplied for this project. The UI covers the six approved phases and **stops before production integrations**.

## Run it

```bash
npm install
npm run dev
```

Open the address printed by Vite (by default `http://localhost:5173`). The development server serves the UI **and** its same-origin, in-memory local auth API. For a built preview, use `npm run build && npm run start` (default port `4173`; set `PORT` to override).

### Try the journey

1. On the landing page, select **Start recovery**.
2. Create a **local test account** with a test email address and a password you do not use elsewhere. Accept the preview terms explicitly.
3. On verification, use the six-digit **local development code displayed on screen**. No email is sent.
4. The authenticated workspace contains **Overview**, **Recovery**, **Trustos AI**, **Verification**, and **Account**.
5. Complete the recovery **walkthrough** to see the Identify → Recover (demo) → Verify states. Completion **does not recover funds or access a wallet**.
6. Switch between light and dark mode in the header or account settings. The setting persists in this browser.

A **Continue with Google** button is present as a future integration entry point. It opens an explicit “not connected” notice rather than pretending to authenticate.

## Implemented phases

| Phase | Where |
| --- | --- |
| Landing page, principles, process, privacy, verification, Core | `/`, `/security`, `/privacy`, `/terms` |
| Login / sign up / email verification / password UI | `/login`, `/signup`, `/verify`, `/forgot-password`, `/reset-password` |
| Local authentication API | `server/localAuth.mjs` mounted under `/api/auth/*` |
| Protected dashboard | `/app` |
| Authenticated Trustos AI interface | `/app/assistant` (local scripted answers only) |
| Guided recovery and review | `/app/recovery`, `/app/verification` (illustrative walkthrough only) |

The interactive Trustos Core on the landing page is a **conceptual process model**, not a live recovery status indicator.

## Boundaries — important

- **No production auth or security guarantee.** This local API holds accounts, salted password hashes, codes, and sessions **in server memory**. Restarting the server clears them. The HTTP-only demo session cookie and on-screen codes are for UI testing, not production security. Never reuse a real password.
- **No email is delivered.** Verification and reset codes are returned by the development API and deliberately shown on screen.
- **No Google OAuth, Supabase, recovery engine, chain requests, live financial transactions, or production AI model** is connected.
- **Do not enter private keys, seed/recovery phrases, or wallet passwords.** The recovery demo only asks for issue categories. The guide blocks obvious secret-like strings, but that check is not guaranteed; guide messages remain in page memory and disappear on refresh.
- The only client-side persisted preferences are **theme** and **non-sensitive local walkthrough event labels** (per preview user). No illustrative “success” represents an actual asset recovery or verification.

## Architecture

```text
src/pages/*  →  src/context/AuthContext.tsx
                         ↓
                 src/services/authService.ts   (replaceable provider adapter)
                         ↓
                 /api/auth/*  →  server/localAuth.mjs  (temporary development API)
```

The pages do not implement authentication directly. A future approved integration can replace the auth service/provider while preserving the page-level contract. Guide responses are isolated in `src/services/guideService.ts`, and local activity in `src/services/demoActivity.ts`.

The supplied original logo is preserved at `public/brand/linuxboss-source.png`. `linuxboss-mark.webp` is a faithful crop of the supplied **LB dragon mark** for navigation and assistant avatars; the favicon comes from that same mark. Fonts are bundled locally in `public/fonts`.

### Development API contract

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/auth/session` | Current development session |
| `POST` | `/api/auth/signup` | Create preview account; returns on-screen `devCode` |
| `POST` | `/api/auth/login` | Log in; flags pending verification |
| `POST` | `/api/auth/verify` | Verify six-digit local code; create session |
| `POST` | `/api/auth/resend` | Rotate local code; 45-second cooldown |
| `POST` | `/api/auth/password/request` | Create on-screen reset code |
| `POST` | `/api/auth/password/reset` | Reset local password; revoke old sessions |
| `POST` | `/api/auth/logout` | End current development session |

## Build & smoke test

```bash
npm run build
npx playwright install chromium   # browser install needed once for smoke testing
npm run test:smoke
```

The smoke test starts its own development server and covers the interactive Core, theme persistence, auth and verification, protected routing, recovery states, local guide, secret guard, mobile overflow checks, logout, and axe-core WCAG AA audits of major dark-theme screens.

**Current boundary:** these six UI phases only. Production integrations require a separate review and explicit approval.
