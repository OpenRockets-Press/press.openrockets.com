import { mysqlTable, serial, varchar, text, timestamp, boolean, int, mysqlEnum } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // ID from global accounts system
  displayName: varchar('display_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['contributor', 'moderator', 'admin']).default('contributor'),
  isSuspended: boolean('is_suspended').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const publications = mysqlTable('publications', {
  id: serial('id').primaryKey(),

  pubId: varchar('pub_id', { length: 50 }).unique().notNull(), // e.g. ORP-1234
  authorId: varchar('author_id', { length: 255 }).references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  abstract: text('abstract'),
  type: mysqlEnum('type', ['book', 'research_paper', 'magazine', 'poster', 'other', '3d_artifact', 'code_gist']).notNull(),
  license: mysqlEnum('license', ['ORP_BEAVER', 'ORP_EAGLE', 'ORP_KANGAROO']).notNull(), // V4 Custom Licenses
  status: mysqlEnum('status', ['pending_review', 'published', 'rejected']).default('pending_review'),
  division: mysqlEnum('division', ['artifacts', '3d', 'code']).notNull().default('artifacts'),
  fileStorageKey: varchar('file_storage_key', { length: 512 }).notNull(), // S3 Key in Oracle Cloud
  coverStorageKey: varchar('cover_storage_key', { length: 512 }),
  customThumbnailStorageKey: varchar('custom_thumbnail_storage_key', { length: 512 }),
  githubRepoUrl: varchar('github_repo_url', { length: 255 }),
  threejsModelKey: varchar('threejs_model_key', { length: 512 }),
  tags: text('tags'), // JSON string of tags
  viewCount: int('view_count').default(0),
  downloadCount: int('download_count').default(0),
  submittedAt: timestamp('submitted_at').defaultNow(),
  publishedAt: timestamp('published_at'),
});

export const cases = mysqlTable('cases', {
  id: varchar('id', { length: 50 }).primaryKey(),
  contributorUserId: varchar('contributor_user_id', { length: 255 }).references(() => users.id).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  status: mysqlEnum('status', ['open', 'in_progress', 'resolved', 'closed']).default('open'),
  priority: mysqlEnum('priority', ['low', 'normal', 'high', 'urgent']).default('normal'),
  relatedPubId: varchar('related_pub_id', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const caseMessages = mysqlTable('case_messages', {
  id: varchar('id', { length: 50 }).primaryKey(),
  caseId: varchar('case_id', { length: 50 }).references(() => cases.id).notNull(),
  senderId: varchar('sender_id', { length: 255 }).references(() => users.id).notNull(),
  senderRole: mysqlEnum('sender_role', ['contributor', 'moderator', 'admin', 'system']).notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = mysqlTable('audit_logs', {
  id: varchar('id', { length: 50 }).primaryKey(),
  actorId: varchar('actor_id', { length: 255 }).references(() => users.id).notNull(),
  action: varchar('action', { length: 255 }).notNull(),
  targetId: varchar('target_id', { length: 255 }),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reviews = mysqlTable('reviews', {
  id: varchar('id', { length: 50 }).primaryKey(),
  pubId: int('pub_id').references(() => publications.id).notNull(),
  reviewerId: varchar('reviewer_id', { length: 255 }).references(() => users.id).notNull(),
  rating: int('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const downloadsLog = mysqlTable('downloads_log', {
  id: serial('id').primaryKey(),
  pubId: int('pub_id').references(() => publications.id).notNull(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  ipAddressHash: varchar('ip_address_hash', { length: 255 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});
