/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRIMARY_API_URL?: string;
  readonly VITE_SECONDARY_API_URL?: string;
  readonly VITE_SOCKET_SERVER_URL?: string;
  readonly VITE_SOCKET_SERVER_PATH?: string;
  readonly VITE_DISABLE_TRANSITIONS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
