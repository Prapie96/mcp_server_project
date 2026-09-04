import "dotenv/config";
import { Pool } from "pg";

console.log(
  "connection string seed database = ",
  process.env.SEED_DATABASE_URL,
);
console.log("connection string database = ", process.env.DATABASE_URL);

export const tenantPool = new Pool({
  connectionString: process.env.TENANT_DATABASE_URL
});
console.log("connection string tenant database = ", process.env.TENANT_DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "",
});

export const seedPool = new Pool({
  connectionString: process.env.SEED_DATABASE_URL,
});

pool.on("connect", () => {
  console.log("Connected Database PostgreSQL");
});

pool.on("error", (error) => {
  console.error(error);
});
