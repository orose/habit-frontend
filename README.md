# habit-frontend

Frontend for habit-tracker-prosjektet. React, TypeScript, Vite, MUI. Lyst/mørkt tema følger
automatisk device-innstillingen (`prefers-color-scheme`) — se `src/useAppTheme.ts`.

`src/theme/` holder designtokens (`tokens.ts`) separat fra MUI-temaoppbyggingen
(`createAppTheme.ts`), og `src/components/` har gjenbrukbare bygge­klosser: `PageLayout`,
`PageHeader`, `AppDialog`, `FormLayout`, `FormActions`, `ListRow`, `EmptyState`, `StreakBadge`.

Krever Node 24 (se `.nvmrc`: `nvm use`).

habit-frontend er en egen deployable, uavhengig av habit-backend (eget Dockerfile, egen
`docker-compose.yml`, egen CI) — se `habit-backend/README.md` for hvordan de kjøres sammen.

## Kjøre lokalt

```
npm install
npm run dev
```

Åpner på http://localhost:5173. API-kall går til `/v1/*`, proxyet av Vite til en ekte backend
(se `vite.config.ts`, default `http://localhost:8080`). For å peke mot en annen backend (f.eks.
en lokal `docker compose up`-instans), kopier `.env.example` til `.env.local` og sett
`VITE_API_BASE_URL` — da kalles backend-URL-en direkte i stedet for å gå via proxyen.

## Bygge, teste og lint

```
npm run build   # tsc + vite build
npm run test    # vitest
npm run lint    # eslint
```

## Kjøre i Docker

```
docker compose up --build
```

Bygger et statisk bygg (Vite) servert av nginx, på http://localhost:8081.
`VITE_API_BASE_URL` bakes inn i bygget (Vite inline'r `import.meta.env.VITE_*` ved build-tid) —
default peker mot habit-backend sin egen docker-compose-port (8080). Siden frontend og backend
er forskjellige origins i Docker, må backend eksplisitt tillate denne origin-en via CORS
(`HABIT_FRONTEND_ORIGIN`, se habit-backends README/`docker-compose.yml`).

## Deploy (roseweb.no)

Push til `master` kjører `.github/workflows/ci.yml`: `verify` (lint + test + build), så
`deploy` som tømmer `/var/www/habit` og `scp`-er `dist/` dit på roseweb.no over SSH.
Docker-imaget bygges kun som en sjekk på PR-er — i produksjon serveres de statiske filene
direkte av Apache, ikke av en container.

Bygget kjøres **uten** `VITE_API_BASE_URL`, så API-kall går til `/v1` relativt. Apache-vhosten
for `habit.roseweb.no` proxier `/v1` → `http://localhost:8091/v1` (habit-backend) og serverer
alt annet fra `/var/www/habit` med fallback til `index.html`.

### GitHub-secrets (repo → Settings → Secrets and variables → Actions)

| Secret | Verdi |
| --- | --- |
| `SSH_PRIVATE_KEY` | Privat halvdel av deploy-nøkkelen |
| `SSH_USER` | Deploy-brukeren på roseweb.no |
| `SSH_HOST` | `roseweb.no` |

Deploy-brukeren må ha skrivetilgang til `/var/www/habit`
(`sudo mkdir -p /var/www/habit && sudo chown $USER /var/www/habit`).
