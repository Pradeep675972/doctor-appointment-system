import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import path from "node:path";
import fs from "node:fs";

const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __vitalisPgPool?: Pool;
  __vitalisDb?: NodePgDatabase;
  __vitalisPglite?: any;
};

let db: NodePgDatabase;
let pool: any;

const MISSING_DATABASE_URL_ERROR =
  "DATABASE_URL environment variable is missing.\n" +
  "In production (e.g., Vercel), an external PostgreSQL connection string is required.\n" +
  "Please add DATABASE_URL in your Vercel Project Settings -> Environment Variables " +
  "(compatible with Neon, Supabase, AWS RDS, Tembo, Railway, etc.).\n" +
  "PGlite embedded database is disabled in production.";

function createMissingDbProxy(): NodePgDatabase {
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === "then" || prop === "$$typeof" || typeof prop === "symbol") {
        return undefined;
      }
      return () => {
        throw new Error(MISSING_DATABASE_URL_ERROR);
      };
    },
  };
  return new Proxy({}, handler) as unknown as NodePgDatabase;
}

if (databaseUrl) {
  // Production / Configured External PostgreSQL
  if (!globalForDb.__vitalisPgPool) {
    const isLocalhost =
      databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");

    globalForDb.__vitalisPgPool = new Pool({
      connectionString: databaseUrl,
      max: process.env.DB_MAX_CONNECTIONS
        ? parseInt(process.env.DB_MAX_CONNECTIONS, 10)
        : 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
    });

    globalForDb.__vitalisPgPool.on("error", (err) => {
      console.error("[PostgreSQL Pool Error]", err.message);
    });
  }

  pool = globalForDb.__vitalisPgPool;
  db = globalForDb.__vitalisDb ?? drizzlePg(pool);
  globalForDb.__vitalisDb = db;
} else if (isProduction) {
  // Production without DATABASE_URL: do NOT initialize PGlite
  pool = {
    query: () => {
      throw new Error(MISSING_DATABASE_URL_ERROR);
    },
    end: async () => {},
  };
  db = createMissingDbProxy();
} else {
  // Local development fallback: PGlite embedded database
  const dataDir = path.join(process.cwd(), ".data", "postgres");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Dynamically load PGlite only in local development
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PGlite } = require("@electric-sql/pglite");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle: drizzlePglite } = require("drizzle-orm/pglite");

  const pglite = globalForDb.__vitalisPglite ?? new PGlite(dataDir);
  globalForDb.__vitalisPglite = pglite;

  pool = {
    query: (queryText: string, params?: any[]) => pglite.query(queryText, params),
    end: async () => {
      await pglite.close();
    },
  };

  db =
    globalForDb.__vitalisDb ??
    (drizzlePglite(pglite) as unknown as NodePgDatabase);
  globalForDb.__vitalisDb = db;
}

export { pool, db };
