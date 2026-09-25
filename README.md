# Trustos — frontend, authentication migration preparation

A responsive React/Vite interface using the supplied official LinuxBoss logo. The legacy development authentication implementation has been removed. **No authentication provider is connected in this phase.** Supabase Auth is planned for a separate phase; it has **not** been installed, configured, or implemented.

## Run it

```bash
npm ci
npm run dev
```

Open the Vite address (usually `http://localhost:5173`). For a built static preview, run `npm run build && npm run start` (default port `4173`, override with `PORT`). Neither server creates accounts, exposes authentication endpoints, or delivers email.

## Current authentication boundary

```text
React UI → AuthContext → authService → NOT CONNECTED
```

`src/context/AuthContext.tsx` and `src/services/authService.ts` remain the application’s integration seam. The old account/session provider and numeric confirmation UI have been removed. Until a separately approved provider is implemented:

- A session lookup resolves to **no signed-in user** through the context’s existing error handling. The auth-service operations reject with an explicit `AUTH_NOT_CONFIGURED` error **without making a network request**; they do not mint users, sessions, or cookies and do not send email.
- Login, signup, email-confirmation, and password-reset screens retain their routes and layout, but visibly state that authentication is unavailable. The forms cannot create an account, sign in, confirm email ownership, or reset a password. The old numeric confirmation and reset workflow is gone. Do not enter a real or reused password into these unconnected screens.
- `/verify` now explains the **future email verification link** for the signup address; its resend-email control is disabled until a provider exists. `/forgot-password` will eventually request a reset email and show an inbox instruction **only after** a real request succeeds. It cannot do so now. `/reset-password` contains just the new-password fields; a future provider must validate the emailed recovery link/session before updating a password. No emailed link is issued, consumed, or validated here.
- Protected routes continue to redirect unauthenticated visitors to `/login`, preserving a selected service in the return URL. **The dashboard, Recovery walkthrough, Trustos AI guide, Verification checklist, and Account screen cannot currently be entered.** There is no development bypass or substitute login.
- Google sign-in remains an unavailable UI option and does not authenticate anyone. No Supabase client, variables, OAuth, email-confirmation flow, alternative auth provider, or fake replacement has been added.

The next auth phase must connect the real provider, session lifecycle, signup/login/error handling, real email-link delivery and return handling, password-recovery session validation, and privacy/security controls. The UI contracts are provider-agnostic and may need adjustment to match the chosen provider; none of those behaviors are simulated here.

## Services and fee boundary

| Free Support — no cost | Separate paid service |
| --- | --- |
| Access Recovery | Actual Wallet Recovery |
| Device / Backup Recovery | **10% fee only when Trustos successfully performs actual wallet recovery.** |
| Security Incident Recovery | No upfront charge; no charge for any Free Support service. |
| Transaction Investigation | |
| Transfer / Asset Recovery Assessment | |
| Scam / Fraud Assistance | |

The public landing catalog is at `/#services`. The same six-plus-one model remains in the protected dashboard and the service selector at `/app/recovery` for when authentication is available. Public card links retain the selected service through signup/login, but **cannot open the workspace while authentication is disconnected**. No listed service is executed by this frontend: the Recovery page is a clearly labelled Identify → Recover → Verify **walkthrough**, not a recovery engine or request submission. It does not access wallets, recover assets, verify transactions, or collect a fee. Completing it records only a non-sensitive browser event, not a result or a review invitation.

The dashboard’s **Verify Transaction** action, when accessible after authentication is connected, is only an accessible external link to `https://trustos.wasmer.app` in a new tab. This frontend neither inspects nor integrates with that site.

The landing Core is a conceptual process model, not a live status indicator. Light/dark theme selection persists and initially follows the device’s preference. The landing sections, branding, and Community & Open Work section are retained.

## Interface map

| Area | Route / status |
| --- | --- |
| Landing, service catalog, principles, process, privacy, verification, Core, community | `/` — public |
| Security, privacy, terms | `/security`, `/privacy`, `/terms` — public |
| Account UI shells | `/login`, `/signup`, `/verify`, `/forgot-password`, `/reset-password` — visible, no provider |
| Workspace and service catalog | `/app` — protected, currently inaccessible |
| Prepared Trustos AI guide | `/app/assistant` — protected, currently inaccessible; no external AI API |
| Guided recovery and verification checklist | `/app/recovery`, `/app/verification` — protected, currently inaccessible |
| Existing external transaction-verification destination | `https://trustos.wasmer.app` — link only, not an integration |

`src/services/serviceCatalog.ts` is the shared service and fee source; `src/components/ServiceCards.tsx` renders free cards and the distinct paid card. `src/services/guideService.ts` holds prepared local answers behind an asynchronous adapter for a separately approved future integration; it calls no AI provider. `src/services/demoActivity.ts` stores only browser-local, non-sensitive walkthrough labels, not recovery progress or credentials.

## Community, source & contact

Community & Open Work stays after the verification section and before the final CTA at `/#community`:

- **No community reviews yet.** No testimonials, names, ratings, success stories, or placeholder reviews are invented. The disconnected review adapter publishes nothing.
- Future publication must follow **actual confirmed recovery → explicit user consent and submission → moderation → publication**. The optional review invitation component is not mounted. The backend, when separately approved, must enforce every condition and redact sensitive material.
- Source: <https://github.com/yzigzag26-lab/Trustos-recover-Frontend>; issues: <https://github.com/yzigzag26-lab/Trustos-recover-Frontend/issues>. Open source is not a security audit.
- Contact: [Email us](mailto:yzigzag26@gmail.com) or [Telegram](https://t.me/TrustOSLLC).

## Privacy and implementation limits

- Never enter a seed/recovery phrase, private key, BIP39 passphrase, wallet password, or real account password into unconnected forms. The guide’s obvious-secret detection is best-effort, not a guarantee; no AI provider or recovery engine receives the messages in this build.
- Sensitive on-device recovery computation is a **future design intent where architecture permits**, not an implemented or universal privacy guarantee.
- There is no production authentication, email, OAuth, Supabase integration, key handling, blockchain request, payment/checkout, database, live transaction, or review backend. The static server serves UI assets only; it does not provide an auth API.
- The existing auth UI and `AuthContext` abstraction have been kept. No fake users, browser-storage auth, test accounts, alternative provider, or hidden sign-in path have been introduced. Theme preference and non-sensitive activity labels are the only browser data this interface intentionally persists; older browser-local activity may remain from an earlier preview.

The original logo source remains in `public/brand/linuxboss-source.png`; `linuxboss-mark.webp` is a faithful navigation/avatar crop, and the favicon uses the same mark. Fonts are bundled locally in `public/fonts`.

## Build and smoke test

```bash
npm run build
npx playwright install chromium   # one-time browser install if not already available
npm run test:smoke
```

Chromium system libraries may also require `npx playwright install-deps chromium` in minimal Linux environments. The smoke test checks the public six-plus-one catalog, honest fee/review copy, source/contact links, Core, system preference and persistent theme, public and auth-shell layouts, protected-route redirects, absence of code-entry forms or auth network calls, truthful unconnected email-link messaging, mobile/tablet overflow, and sampled axe-core WCAG AA audits. It also tests the local catalog/guide contracts without forging an authenticated session. **Authenticated dashboard, Recovery, guide, and account browser flows cannot run without a real provider and must be revalidated in the next phase.**
