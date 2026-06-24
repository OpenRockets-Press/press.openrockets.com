/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT?: string;
  readonly VITE_APPWRITE_PROJECT_ID?: string;
  readonly VITE_APPWRITE_DATABASE_ID?: string;
  readonly VITE_FUNCTION_REGISTER_ID?: string;
  readonly VITE_FUNCTION_CONFIRM_CONSENT_ID?: string;
  readonly VITE_FUNCTION_GET_HOME_FEED_ID?: string;
  readonly VITE_FUNCTION_SUBMIT_PUBLICATION_ID?: string;
  readonly VITE_FUNCTION_REVIEW_PUBLICATION_ID?: string;
  readonly VITE_FUNCTION_OPEN_CASE_ID?: string;
  readonly VITE_FUNCTION_REPLY_CASE_ID?: string;
  readonly VITE_FUNCTION_RESOLVE_CASE_ID?: string;
  readonly VITE_FUNCTION_DSAR_HANDLER_ID?: string;
  readonly VITE_FUNCTION_SERVE_PDF_ID?: string;
  readonly VITE_APPWRITE_BUCKET_PUB_FILES?: string;
  readonly VITE_APPWRITE_BUCKET_PUB_COVERS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
