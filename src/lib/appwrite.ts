import {
  Account,
  Client,
  Databases,
  Functions,
  ID,
  Query,
  Storage,
  type Models,
} from "appwrite";

export const appwriteConfig = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT as string | undefined,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID as string | undefined,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID as string | undefined,
  registerFunctionId: import.meta.env.VITE_FUNCTION_REGISTER_ID as string | undefined,
  confirmConsentFunctionId: import.meta.env.VITE_FUNCTION_CONFIRM_CONSENT_ID as string | undefined,
  homeFeedFunctionId: import.meta.env.VITE_FUNCTION_GET_HOME_FEED_ID as string | undefined,
  submitPublicationFunctionId: import.meta.env.VITE_FUNCTION_SUBMIT_PUBLICATION_ID as string | undefined,
  reviewPublicationFunctionId: import.meta.env.VITE_FUNCTION_REVIEW_PUBLICATION_ID as string | undefined,
  openCaseFunctionId: import.meta.env.VITE_FUNCTION_OPEN_CASE_ID as string | undefined,
  replyCaseFunctionId: import.meta.env.VITE_FUNCTION_REPLY_CASE_ID as string | undefined,
  resolveCaseFunctionId: import.meta.env.VITE_FUNCTION_RESOLVE_CASE_ID as string | undefined,
  dsarHandlerFunctionId: import.meta.env.VITE_FUNCTION_DSAR_HANDLER_ID as string | undefined,
  pubFilesBucketId: (import.meta.env.VITE_APPWRITE_BUCKET_PUB_FILES as string | undefined) ?? "pub_files",
  pubCoversBucketId: (import.meta.env.VITE_APPWRITE_BUCKET_PUB_COVERS as string | undefined) ?? "pub_covers",
};

export const isAppwriteConfigured = Boolean(appwriteConfig.endpoint && appwriteConfig.projectId);

const client = new Client();
if (isAppwriteConfigured) {
  client.setEndpoint(appwriteConfig.endpoint as string).setProject(appwriteConfig.projectId as string);
}

export const account = isAppwriteConfigured ? new Account(client) : null;
export const databases = isAppwriteConfigured ? new Databases(client) : null;
export const functions = isAppwriteConfigured ? new Functions(client) : null;
export const storage = isAppwriteConfigured ? new Storage(client) : null;

export { ID, Query };
export type { Models };
