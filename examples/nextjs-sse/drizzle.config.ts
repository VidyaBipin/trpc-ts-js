import { defineConfig } from 'drizzle-kit';

if (!process.env.POSTGRES_URL) {
  throw new Error('Missing POSTGRES_URL environment variable');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/server/db.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
});
