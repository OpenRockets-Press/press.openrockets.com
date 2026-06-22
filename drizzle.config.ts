import type { Config } from 'drizzle-kit';

export default {
  schema: './server/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'mysql://orp_user:orp_pass_123@127.0.0.1:3306/press_db',
  },
} satisfies Config;
