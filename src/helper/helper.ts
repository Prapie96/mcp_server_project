import { PoolClient } from "pg";
import { pool } from "../db/connection.js";
import { TenantIdType } from "../middleware/auth.js";

export const splitText = (text: string, maxLength = 500) => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = "";
  let chunks = [];
  for (const sentence of sentences) {
    if ((current + sentence).length > maxLength) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += " " + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
};



export async function transactionWrapper<T>(tenantId:TenantIdType,callback:(client:PoolClient)=>Promise<T>):Promise<T>{
  const client = await pool.connect();
  try {
    // Open Transaction
    await client.query("BEGIN");
    
    // set schema from tenantId
    await client.query(`SET LOCAL search_path TO ${tenantId} ,public`)
    // exucute sql
    const result = await callback(client);
    // COMMIT
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}