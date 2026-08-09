export type PurchaseModel = {
  id: string;
  customer_id: string;
  total_amount: number;
  status: string;
  order_item: JSON;
  created_at: string;
};
