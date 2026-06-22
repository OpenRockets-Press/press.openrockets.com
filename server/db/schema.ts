import { mysqlTable, serial, varchar, text, timestamp, boolean, int, mysqlEnum } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // ID from global accounts system
  displayName: varchar('display_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['contributor', 'moderator', 'admin']).default('contributor'),
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
  fileStorageKey: varchar('file_storage_key', { length: 512 }).notNull(), // S3 Key in Oracle Cloud
  coverStorageKey: varchar('cover_storage_key', { length: 512 }),
  tags: text('tags'), // JSON string of tags
  viewCount: int('view_count').default(0),
  downloadCount: int('download_count').default(0),
  submittedAt: timestamp('submitted_at').defaultNow(),
  publishedAt: timestamp('published_at'),
});
