import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// In Next.js serverless / edge the module is re-imported per request in dev,
// so we cache the client on the global object to avoid exhausting connections.
declare global {
  // eslint-disable-next-line no-var
  var _postgresClient: ReturnType<typeof postgres> | undefined;
}

const client =
  global._postgresClient ??
  postgres(process.env.DATABASE_URL!, {
    // Tune these for your deployment (Neon, Supabase, Railway, etc.)
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10
  });

if (process.env.NODE_ENV !== 'production') {
  global._postgresClient = client;
}

export const db = drizzle({ client, schema });
