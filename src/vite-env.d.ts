// src/vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHEETS_WEBHOOK_URL: string
  readonly VITE_SHEETS_WEBHOOK_KEY?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
