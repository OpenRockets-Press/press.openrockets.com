import { Client, Databases, ID, Query, Storage, Users } from "node-appwrite";
import { getEnv } from "./env";

export function createAdminServices() {
  const env = getEnv();

  const client = new Client()
    .setEndpoint(env.appwriteEndpoint)
    .setProject(env.appwriteProjectId)
    .setKey(env.appwriteApiKey);

  return {
    env,
    client,
    id: ID,
    query: Query,
    db: new Databases(client),
    users: new Users(client),
    storage: new Storage(client),
  };
}
