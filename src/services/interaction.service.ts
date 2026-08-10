import { pool } from "../db/connection.js";
import { splitText } from "../helper/helper.js";
import pgvector from "pgvector";
import { createEmbedding } from "./embedding.service.js";
import { InteractionModel } from "../model/interaction.js";

interface SaveInteractionInput {
  customerId: string;
  content: string;
}

export async function saveInteraction({
  customerId,
  content,
}: SaveInteractionInput) {
  try {
    if (content.length > 5000) {
      throw new Error("Interaction content exceeds maximum allowed length.");
    }
    const chunks = splitText(content);
    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk);

      await pool.query(
        `
                INSERT INTO interactions 
                (customer_id,content,embedding)
                VALUES
                ($1,$2,$3::vector)
            
            `,
        [customerId, chunk, pgvector.toSql(embedding)],
      );
    }
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error saving interaction to RAG:", error);
    return {
      success: false,
    };
  }
}

export async function searchInteraction(
  content: string,
): Promise<Pick<InteractionModel, "customer_id" | "content">[]> {
  try {
    const embedding = await createEmbedding(content);
    const response = await pool.query(
      `
                SELECT id, customer_id,content
                FROM interactions
                ORDER BY embedding <=> $1::vector
                LIMIT 2
            `,
      [pgvector.toSql(embedding)],
    );
    const result = response.rows.map((data) => ({
      customer_id: data.customer_id,
      content: data.content,
    }));
    return result;
  } catch (error) {
    console.error("Error saving interaction to RAG:", error);
    return [];
  }
}
