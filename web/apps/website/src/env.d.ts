/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Origin of the backend API (e.g. "https://api.example.org").
   * Empty or unset = same-origin relative requests; the dev server proxies
   * /api to the backend (vite.config.ts).
   */
  readonly VITE_API_BASE_URL?: string;
}
