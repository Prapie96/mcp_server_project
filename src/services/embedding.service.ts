import { FeatureExtractionPipeline, pipeline } from "@huggingface/transformers";

let extractor: FeatureExtractionPipeline | null = null;

export const initEmbeddingModel = async () => {
  if (!extractor) {
    console.error("Loading Model AI for Embedding ...");
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.error("Model Is Ready....");
  }
};

export const createEmbedding = async (sentence: string) => {
  if (!extractor) {
    throw new Error("Model Embedding  initialize not yet");
  }
  const output = await extractor(sentence, {
    pooling: "mean",
    normalize: true,
  });
  console.error("Vector from sentence = ", output);
  return Array.from(output.data);
};
