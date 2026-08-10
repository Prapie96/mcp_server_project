import { pool } from "../db/connection.js";
import { Customer } from "../model/customer.js";
import { PurchaseModel } from "../model/purchase.js";

export async function search_customer_info(
  search: string,
  limit: number,
): Promise<Customer[]> {
  const searchTerm = `%${search}%`;
  const result = await pool.query<Customer>(
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
          LIMIT $2
          `,
    [searchTerm, limit],
  );
  console.error(
    `[DB] พบลูกค้า ${result.rows.length} คน จากคำค้นหา: ${search} ข้อมูล ${result.rows}`,
  );
  return result.rows;
}

export async function insert_customer_info({
  email,
  first_name,
  last_name,
  phone,
}: Omit<Customer, "id" | "created_at">): Promise<string> {
  const result = await pool.query<Pick<Customer, "id">>(
    `
        INSERT INTO customers(email,first_name,last_name,phone)
        VALUES ($1,$2,$3,$4)
        RETURNING id
        `,
    [email, first_name, last_name, phone],
  );
  console.error("ผลลัพธ์ที่ได้จาก SQL:", result.rows);
  return result.rows[0].id;
}

export async function search_purchase(customer_id: string) {
  const sql = `SELECT 
        id,
        customer_id,
        total_amount,
        status,
        order_item,
        order_item,
        created_at
        FROM purchase
        WHERE customer_id = $1
        `;
  const result = await pool.query<PurchaseModel>(sql, [customer_id]);
  return result.rows;
}

export async function calculate_purchase(customer_id: string) {
  const sql = `
          SELECT
            c.id,
            c.first_name || ' ' || c.last_name AS customer_name,
            COUNT(p.id) as total_orders,
            COALESCE(SUM(p.total_amount),0.00) AS all_purchase_total,
          FROM customers c
          LEFT JOIN purchase p 
          ON p.customer_id = c.id
          WHERE c.id = $1
          GROUP BY c.id ,c.first_name , c.last_name;
        
        `;
  const result = await pool.query(sql, [customer_id]);
  return result.rows;
}
