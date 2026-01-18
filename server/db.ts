import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Add SSL support for production (Supabase/Neon)
const connectionString = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === "production" || connectionString.includes("supabase") || connectionString.includes("neon");

export const pool = new Pool({ 
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
