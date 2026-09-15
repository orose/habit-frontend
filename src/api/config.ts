/**
 * habit-backend is a separate deployable with its own origin. When empty
 * (the default - local `npm run dev`, or Vitest), API calls stay relative
 * (`/v1/...`) and rely on Vite's dev proxy. Set at build time via the
 * VITE_API_BASE_URL env var (see Dockerfile / docker-compose.yml) to point
 * at a standalone backend, e.g. http://localhost:8080.
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "";
