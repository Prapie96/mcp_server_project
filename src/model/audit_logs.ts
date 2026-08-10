export type AuditLogsModel = {
  id: string;
  purchase_id: string;
  customer_id: string;
  operation_type: string;
  previous_amount: string;
  new_amount: string;
  amount_delta: string;
  previous_hash: string;
  current_hash: string;
  reason: string;
  action_by: string;
  created_at: string;
};
