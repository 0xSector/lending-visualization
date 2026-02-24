/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALLIUM_API_KEY: string | undefined;
  readonly VITE_POLL_INTERVAL_MS: string | undefined;
  readonly VITE_DRIP_INTERVAL_MS: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
