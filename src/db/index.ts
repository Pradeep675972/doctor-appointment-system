import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import path from "node:path";
import fs from "node:fs";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPglite?: PGlite;
  __arenaNextJsDb?: NodePgDatabase;
};

let db: NodePgDatabase;
let pool: any;

if (databaseUrl) {
  pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  db = globalForDb.__arenaNextJsDb ?? drizzlePg(pool);
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsDb = db;
  }
} else {
  const dataDir = path.join(process.cwd(), ".data", "postgres");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const pglite =
    globalForDb.__arenaNextJsPglite ??
    new PGlite(dataDir);

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPglite = pglite;
  }

  pool = {
    query: (queryText: string, params?: any[]) => pglite.query(queryText, params),
    end: async () => {
      await pglite.close();
    },
  };

  db = globalForDb.__arenaNextJsDb ?? (drizzlePglite(pglite) as unknown as NodePgDatabase);
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsDb = db;
  }
}

export { pool, db };
