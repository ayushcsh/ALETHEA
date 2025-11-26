import {GoogleGenAI} from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: "AIzaSyDhsIqtHikYrYq0zTgkxUFHYrpFC6jejlk" ,
});

export async function getEmbedding(text: string): Promise<number[]> {
    try{
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
  } catch (error) {
    console.error("Embedding generation error:", error);
    throw new Error("Failed to generate embeddings");
  }
}