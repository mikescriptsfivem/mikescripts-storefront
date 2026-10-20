/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TEBEX_PUBLIC_TOKEN?: string
  readonly VITE_BASE_PATH?: string
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
