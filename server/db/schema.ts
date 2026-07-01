import { mysqlTable, serial, varchar, text, timestamp, boolean, int, mysqlEnum, index } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // ID from global accounts system
  displayName: varchar('display_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['contributor', 'moderator', 'admin']).default('contributor'),
  isSuspended: boolean('is_suspended').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const publications = mysqlTable('publications', {
  id: int('id').autoincrement().primaryKey(),

  pubId: varchar('pub_id', { length: 50 }).unique().notNull(), // e.g. ORP-1234
  authorId: varchar('author_id', { length: 255 }).references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  subtitle: varchar('subtitle', { length: 512 }),
  abstract: text('abstract'),
  type: mysqlEnum('type', ['book', 'research_paper', 'magazine', 'poster', 'other', '3d_artifact', 'code_gist', '3d_model', 'software_code', 'image']).notNull(),
  license: mysqlEnum('license', ['ORP_BEAVER', 'ORP_EAGLE', 'ORP_KANGAROO']).notNull(), // V4 Custom Licenses
  status: mysqlEnum('status', ['pending_review', 'published', 'rejected']).default('pending_review'),
  division: mysqlEnum('division', ['artifacts', '3d', 'code']).notNull().default('artifacts'),
  publisherId: varchar('publisher_id', { length: 255 }),
  fileStorageKey: varchar('file_storage_key', { length: 512 }), // Kept for backwards compat, nullable now
  extraFiles: text('extra_files'), // JSON array of additional file keys
  coverStorageKey: varchar('cover_storage_key', { length: 512 }),
  customThumbnailStorageKey: varchar('custom_thumbnail_storage_key', { length: 512 }),
  githubRepoUrl: varchar('github_repo_url', { length: 255 }),
  threejsModelKey: varchar('threejs_model_key', { length: 512 }),
  tags: text('tags'), // JSON string of tags
  communities: text('communities'), // JSON string of community IDs
  links: text('links'), // JSON string of links array
  shortId: varchar('short_id', { length: 7 }).unique(), // e.g. 845s73v
  codeSnippet: varchar('code_snippet', { length: 255 }), // 190 char precomputed snippet
  primaryLanguage: varchar('primary_language', { length: 50 }),
  previewStorageKey: varchar('preview_storage_key', { length: 512 }),
  viewCount: int('view_count').default(0),
  downloadCount: int('download_count').default(0),
  submittedAt: timestamp('submitted_at').defaultNow(),
  publishedAt: timestamp('published_at'),
}, (table) => ({
  titleIdx: index('title_idx').on(table.title),
  statusIdx: index('status_idx').on(table.status),
  divisionIdx: index('division_idx').on(table.division),
  authorIdx: index('author_idx').on(table.authorId),
}));

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
