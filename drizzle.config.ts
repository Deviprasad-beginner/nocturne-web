import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const dbUrl = new URL(process.env.DATABASE_URL);
const host = dbUrl.hostname;
const port = parseInt(dbUrl.port || "5432");
const user = dbUrl.username;
const password = dbUrl.password;
const database = dbUrl.pathname.slice(1);

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host,
    port,
    user,
    password,
    database,
    ssl: {
      rejectUnauthorized: false,
      servername: process.env.DB_SNI_SERVERNAME,
    },
  },
});
