/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MESHY_MOCK?: string;
  readonly VITE_MESHY_PROXY_BASE?: string;
  readonly VITE_MOCK_GLB_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
