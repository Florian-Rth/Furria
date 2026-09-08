/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface RuntimeConfig {
  API_BASE_URL?: string;
}

interface Window {
  __RUNTIME_CONFIG__?: RuntimeConfig;
}
