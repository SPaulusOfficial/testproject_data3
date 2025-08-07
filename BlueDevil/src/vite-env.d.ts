/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MEETING_ASSISTANT_API_BASE: string
  readonly VITE_MEETING_ASSISTANT_API_KEY: string
  readonly VITE_DEMO_MEETING_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 