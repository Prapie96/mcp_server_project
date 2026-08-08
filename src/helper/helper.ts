import { OpenAI } from "openai/client.js";
import dotenv from "dotenv";
import { pipeline } from "@huggingface/transformers";
dotenv.config();

// const openai = new OpenAI({
//   //   apiKey: process.env.OPENAI_API_KEY,
//   baseURL: "http://127.0.0.1:1234/v1",
//   apiKey: "lm-studio-embedding",
// });
// export const createEmbedding = async (text: string) => {
//   const prefixedText = `search_document: ${text}`;
//   const response = await openai.embeddings.create({
//     // model: "text-embedding-3-small",
//     model: "text-embedding-nomic-embed-text-v2-moe",
//     input: prefixedText,
//     encoding_format: "float",
//   });
//   return response.data[0].embedding;
// };

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
