export const account = null as any;
export const databases = null as any;
export const storage = null as any;
export const isAppwriteConfigured = false;
export const ID = { unique: () => Date.now().toString() };
export const Query = {
  equal: () => '',
  orderDesc: () => '',
  limit: () => ''
} as any;
export const appwriteConfig = {
  databaseId: '',
  pubFilesBucketId: '',
  pubCoversBucketId: ''
};
