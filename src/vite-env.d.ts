/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMMA_API_URL?: string;
  readonly VITE_GEMMA_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
