import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Required for Cloudflare Workers to handle connection caching properly over fetch
neonConfig.fetchConnectionCache = true;

// Creates a serverless HTTP client instead of a TCP socket
const sql = neon(process.env.POSTGRES_URL);

export const db = drizzle(sql, { schema });