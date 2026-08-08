import { pool } from "../db/connection.js";
import { Customer } from "../model/customer.js";

export async function searchFirstCustomer(search: string): Promise<Customer> {
  const searchTerm = `%${search}%`;
  const result = await pool.query(
    `
      SELECT 
            id,
            first_name,
            last_name,
            email,
            phone,
            created_at
      FROM customers
      WHERE email ILIKE $1
      OR first_name ILIKE $1 
      OR last_name ILIKE $1 
      OR phone ILIKE $1
      ORDER BY created_at ASC
      LIMIT 1;
    `,
    [searchTerm],
  );
  console.error("ผลลัพธ์ที่ได้จาก SQL:", result.rows);
  return result.rows[0];
}

export async function search_customer_info(
  search: string,
): Promise<Customer[]> {
  const searchTerm = `%${search}%`;
  const customer = await pool.query(
    `
          SELECT 
          id,
          email,
          first_name,
          last_name,
          phone,
          created_at
          FROM customers
          WHERE
          email ILIKE $1 OR
          first_name ILIKE $1 OR
          last_name ILIKE $1 OR
          phone ILIKE $1 
          LIMIT 5
          `,
    [searchTerm],
  );
  console.error("ผลลัพธ์ที่ได้จาก SQL:", customer.rows);
  return customer.rows;
}
