import {
  Account,
  Client,
  Databases,
  ID,
  Query,
  Storage,
  type Models,
} from "appwrite";

export const appwriteConfig = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT as string | undefined,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID as string | undefined,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID as string | undefined,
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
export const storage = isAppwriteConfigured ? new Storage(client) : null;

export { ID, Query };
export type { Models };
