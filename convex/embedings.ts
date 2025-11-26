import {
  action,
  internalAction,
  internalMutation,
  query,
} from "../convex/_generated/server";
import { Id } from "../convex/_generated/dataModel";
import { v } from "convex/values";
import { chunktext } from "../utils/chunktext";
import { getEmbedding } from "../utils/getEmbedding";
import { api, internal } from "../convex/_generated/api";
import { internalQuery } from "../convex/_generated/server";

// import {nodeActions} from "";

export const getRelevantContext = query({
  args: {
    embeddingIds: v.array(v.id("pdfembeddings")),
  },
  handler: async (ctx, { embeddingIds }) => {
    const results = await Promise.all(embeddingIds.map((id) => ctx.db.get(id)));

    // Filter out nulls and return just the text fields
    return results.filter((res) => res !== null).map((res) => res!.chunk);
  },
});
export const getid = internalQuery({
  args: {
    pdfId: v.id("pdfs"),
  },
  handler: async (ctx, { pdfId }: { pdfId: Id<"pdfs"> }) => {
    const pdf = await ctx.db.get(pdfId);
    if (!pdf) {
      throw new Error("PDF not found");
    }
    return pdf;
  },
});

export const insert = internalMutation({
  args: {
    pdfId: v.id("pdfs"),
    chunk: v.string(),
    embedding: v.array(v.number()),
    createdAt: v.number(),
  },
  handler: async (
    ctx,
    {
      pdfId,
      chunk,
      embedding,
      createdAt,
    }: {
      pdfId: Id<"pdfs">;
      chunk: string;
      embedding: number[];
      createdAt: number;
    }
  ) => {
    await ctx.db.insert("pdfembeddings", {
      pdfId,
      chunk,
      embedding,
      createdAt,
    });
  },
});

export const embedings = action({
  args: {
    pdfId: v.id("pdfs"),
  },

  handler: async (
    ctx,
    { pdfId }: { pdfId: Id<"pdfs"> }
  ): Promise<{ url: string }> => {
    // get the pdf record
    // const pdf = await ctx.db.get(pdfId);
    const pdf = await ctx.runQuery(internal.embedings.getid, { pdfId });
    if (!pdf) {
      throw new Error("PDF not found");
    }
    // fetch pdf content from storage
    const url = await ctx.storage.getUrl(pdf.storageId);
    console.log("Fetched PDF URL:", url);
    if (!url) {
      throw new Error("Failed to get PDF URL from storage");
    }

    // 3Extract text from PDF (you can use a server utility or library)
    const text = await ctx.runAction(api.nodeActions.extractText, {
      url,
      fileName: pdf.fileName,
    });

    // chunk text into smaller pieces
    const chunks = chunktext(text, 200); // adjust chunk size as needed

    // process each chunk and store into convex

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await getEmbedding(chunk);
      // store this embedding

      await ctx.runMutation(internal.embedings.insert, {
        pdfId,
        chunk,
        embedding,
        createdAt: Date.now(),
      });
    }

    return { url };
  },
});

export const getvectorembeddings = internalAction({
  args: {
    pdfId: v.id("pdfs"),
    queryText: v.string(),
    topK: v.optional(v.number()),
  },
  handler: async (
    ctx,
    {
      pdfId,
      queryText,
      topK,
    }: { pdfId: Id<"pdfs">; queryText: string; topK?: number }
  ) => {
    // get embedding for query text
    console.log("🔎 getvectorembeddings called with:", { pdfId, queryText, topK });
    const queryEmbedding = await getEmbedding(queryText);
    console.log("📊 Generated query embedding, length:", queryEmbedding.length);


    // Perform vector similarity search in Convex
    const searchResults = await ctx.vectorSearch("pdfembeddings", "by_embedding",  {
      vector: queryEmbedding,
      filter: (q) => q.eq("pdfId", pdfId),
      limit: topK,
    });
    console.log("🧠 Vector search results:", searchResults);
    // extract the IDs of matched embeddings
    const ids = searchResults.map((r) => r._id);
    console.log("Vector Search IDs:", ids);
    

    // fetch the full records from Convex using the IDs
    const chunkTexts: string[] = await ctx.runQuery(
      api.embedings.getRelevantContext,
      {
        embeddingIds: ids,
      }
    );
    console.log("📚 Retrieved chunk texts:", chunkTexts.length);
    const uniqueTexts = [...new Set(chunkTexts.map((t) => t.trim()))];
    console.log("✅ Unique relevant chunks:", uniqueTexts.length);
    return uniqueTexts;
  },
});
