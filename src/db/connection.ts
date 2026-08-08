import dotenv from "dotenv";
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "",
});

pool.on("connect", () => {
  console.log("Connected Database PostgreSQL");
});

pool.on("error", (error) => {
  console.error(error);
});
