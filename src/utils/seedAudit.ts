import { seedPool } from "../db/connection.js";
import { PurchaseModel } from "../model/purchase.js";
import crypto from "crypto";
export async function seedAuditLogsWithHash() {
  try {
    console.log("Seeding audit logs");
    // เช็คว่า seed ไปหรือยัง
    const checkAuditExist = await seedPool.query(
      `SELECT COUNT(*) FROM audit_logs`,
    );
    if (checkAuditExist.rows[0].count > 0) {
      console.error("Already audit Logs data skip seeding");
      return;
    }

    // 1.ดึงข้อมูล purchase
    const selectPurchaseSQL = `SELECT id,customer_id,total_amount,status,order_item,created_at FROM purchase`;
    const purchasesResult =
      await seedPool.query<PurchaseModel>(selectPurchaseSQL);
    const purchases = purchasesResult.rows;
    if (purchases.length === 0) {
      console.error("ไม่พบข้อมูล purchase ในระบบ กรุณาตรวจสอบ seed.sql");
      return;
    }

    // 2.ดึง Hash ตัวก่อนหน้า
    const selectLogSQL = `SELECT current_hash FROM audit_logs ORDER BY created_at DESC LIMIT 1`;
    const lastLog = await seedPool.query(selectLogSQL);
    let prevHash =
      lastLog.rows.length > 0
        ? lastLog.rows[0].current_hash
        : "GENESIS_HASH_00000000000000000000000000000000000000000000";

    // 3.INSERT
    for (const p of purchases) {
      const insertResult = await insertAuditLogs({
        prevHash,
        purchaseId: p.id,
        customerId: p.customer_id,
        type: "CREATE",
        prevAmount: 0.0,
        newAmount: p.total_amount,
        reason: "CREATE FROM PURCHASE TRANSACTION",
        actionBy: "EMPLOYEE",
      });
      prevHash = insertResult.currentHash;
    }
    if (purchases.length > 0) {
      const target = purchases[0];
      const oldAmount = target.total_amount;
      const updateAmount = 3950;
      // insert new purchase change
      const sql = `INSERT INTO purchase (previous_purchase_id,customer_id, total_amount, status, order_item)
                   VALUES($1, $2, $3, $4,$5)
                   RETURNING id;
        `;
      const newPurchaseInsert = await seedPool.query<PurchaseModel>(sql, [
        target.id,
        target.customer_id,
        updateAmount,
        "COMPLETED",
        JSON.stringify(target.order_item),
      ]);

      // insert new Audit_logs
      await insertAuditLogs({
        prevHash,
        purchaseId: newPurchaseInsert.rows[0].id,
        customerId: target.customer_id,
        type: "UPDATE",
        prevAmount: oldAmount,
        newAmount: updateAmount,
        reason: `PURCHASE ID : ${target.id} HAS CHANGED AMOUNT INCREASED FROM COST INCREASED`,
        actionBy: "EMPLOYEE",
      });
    }
    if (purchases.length > 1) {
      const target = purchases[1];
      const oldAmount = target.total_amount;
      const sql = `UPDATE purchase SET status = $1 WHERE id = $2;`;
      await seedPool.query(sql, ["CANCELLED", target.id]);

      await insertAuditLogs({
        prevHash,
        purchaseId: target.id,
        customerId: target.customer_id,
        type: "DELETE",
        prevAmount: oldAmount,
        newAmount: 0.0,
        reason: `CANCEL AND DELETE PURCHASE ORDER`,
        actionBy: "ADMIN",
      });
    }
    console.log("Seed audit_logs with hash chain successfully!");
  } catch (error) {
    console.error("Error during seed audit_logs table : ", error);
  }
}

interface InsertAuditLog {
  prevHash: string;
  purchaseId: string;
  customerId: string;
  type: string;
  prevAmount: number;
  newAmount: number;
  reason: string;
  actionBy: string;
}

async function insertAuditLogs({
  prevHash,
  purchaseId,
  customerId,
  type,
  prevAmount,
  newAmount,
  reason,
  actionBy,
}: InsertAuditLog) {
  // CREATE HASH
  const timeStamp = new Date().toISOString();
  const dataString = `${customerId}${purchaseId}${type}${prevAmount}${newAmount}${timeStamp}${prevHash}`;
  const current_hash = crypto
    .createHash("sha256")
    .update(dataString)
    .digest("hex");
  //   INSERT
  await seedPool.query(
    `INSERT INTO audit_logs 
        (purchase_id,customer_id,operation_type,previous_amount,new_amount,previous_hash,current_hash,reason,action_by)
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        `,
    [
      purchaseId,
      customerId,
      type,
      prevAmount,
      newAmount,
      prevHash,
      current_hash,
      reason,
      actionBy,
    ],
  );
  return { currentHash: current_hash };
}
