import {GoogleGenAI} from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_API_KEY is not defined in environment variables");
}

const ai = new GoogleGenAI({ apiKey });

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const result = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: {
        outputDimensionality: 768,
        taskType: "SEMANTIC_SIMILARITY",
      },
    });
    if (
      !result.embeddings ||
      !Array.isArray(result.embeddings) ||
      result.embeddings.length === 0
    ) {
      throw new Error("No embeddings returned from the API");
    }
    return result.embeddings[0].values as Array<number>;
  } catch (error: any) {
    console.error("Embedding generation error:", error);
    throw new Error(`Failed to generate embeddings: ${error.message}`);
  }
}