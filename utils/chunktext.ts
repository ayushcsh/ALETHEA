import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function chunkText(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });

  const chunks = await splitter.splitText(text);

  return chunks;
}