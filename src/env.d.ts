/// <reference types="vite/client" />

declare module 'swiper/css' {
  const content: string;
  export default content;
}
declare module 'swiper/css/free-mode' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_PUBLIC_SUPABASE_URL: string;
  readonly VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_PUBLIC_ADMIN_USER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
