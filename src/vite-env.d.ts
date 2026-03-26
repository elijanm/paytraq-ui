/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MPESA_SIMULATE: string
  readonly VITE_MPESA_SHORTCODE: string
  readonly VITE_CURRENCY: string
  readonly VITE_POOL_PRICE_PER_GAME: string
  readonly VITE_WASHER_RATE: string
  readonly VITE_DRYER_RATE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
