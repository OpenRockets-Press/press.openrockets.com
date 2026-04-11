export interface AppEnv {
  appwriteEndpoint: string;
  appwriteProjectId: string;
  appwriteApiKey: string;
  appwriteDatabaseId: string;
  consentTokenSecret: string;
  guardianEmailSecret: string;
  appBaseUrl: string;
  pubFilesBucketId: string;
  pubCoversBucketId: string;
  caseAttachmentsBucketId: string;
  plausibleDomain?: string;
  plausibleApiKey?: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getEnv(): AppEnv {
  return {
    appwriteEndpoint: required("APPWRITE_ENDPOINT"),
    appwriteProjectId: required("APPWRITE_PROJECT_ID"),
    appwriteApiKey: required("APPWRITE_API_KEY"),
    appwriteDatabaseId: required("APPWRITE_DATABASE_ID"),
    consentTokenSecret: required("CONSENT_TOKEN_SECRET"),
    guardianEmailSecret: process.env.GUARDIAN_EMAIL_SECRET || required("CONSENT_TOKEN_SECRET"),
    appBaseUrl: process.env.APP_BASE_URL ?? "https://press.openrockets.com",
    pubFilesBucketId: process.env.APPWRITE_BUCKET_PUB_FILES ?? "pub_files",
    pubCoversBucketId: process.env.APPWRITE_BUCKET_PUB_COVERS ?? "pub_covers",
    caseAttachmentsBucketId: process.env.APPWRITE_BUCKET_CASE_ATTACHMENTS ?? "case_attachments",
    plausibleDomain: process.env.PLAUSIBLE_DOMAIN,
    plausibleApiKey: process.env.PLAUSIBLE_API_KEY,
  };
}
