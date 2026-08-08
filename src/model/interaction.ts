export type InteractionModel = {
  id: string;
  customer_id: string;
  interaction_type: string;
  content: string;
  embedding: Float32Array;
  created_at: string;
};
