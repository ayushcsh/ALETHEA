import {
  action,
  internalAction,
  internalMutation,
  query,
} from "../convex/_generated/server";
import { Id } from "../convex/_generated/dataModel";
import { v } from "convex/values";
import { chunkText } from "../utils/chunktext";
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

    return results
      .filter((res) => res !== null)
      .map((res) => ({ chunk: res!.chunk, fileName: res!.fileName ?? null }));
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
    fileName: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      pdfId,
      chunk,
      embedding,
      createdAt,
      fileName,
    }: {
      pdfId: Id<"pdfs">;
      chunk: string;
      embedding: number[];
      createdAt: number;
      fileName?: string;
    }
  ) => {
    await ctx.db.insert("pdfembeddings", {
      pdfId,
      chunk,
      embedding,
      createdAt,
      fileName,
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

    const text = await ctx.runAction(api.nodeActions.extractText, {
      url,
      fileName: pdf.fileName,
    });

    const chunks = await chunkText(text);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await getEmbedding(chunk);

      await ctx.runMutation(internal.embedings.insert, {
        pdfId,
        chunk,
        embedding,
        createdAt: Date.now(),
        fileName: pdf.fileName,
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
    const records: { chunk: string; fileName: string | null }[] =
      await ctx.runQuery(api.embedings.getRelevantContext, {
        embeddingIds: ids,
      });
    console.log("📚 Retrieved chunk records:", records.length);

    const uniqueTexts = [...new Set(records.map((r) => r.chunk.trim()))];
    let sources = [
      ...new Set(
        records.map((r) => r.fileName).filter((f): f is string => Boolean(f))
      ),
    ];

    // Older embeddings predate storing fileName per chunk — fall back to the
    // parent PDF's fileName so sources still show up for those documents.
    if (!sources.length && uniqueTexts.length) {
      const pdf = await ctx.runQuery(internal.embedings.getid, { pdfId });
      if (pdf?.fileName) {
        sources = [pdf.fileName];
      }
    }

    console.log("✅ Unique relevant chunks:", uniqueTexts.length, "Sources:", sources);
    return { chunks: uniqueTexts, sources };
  },
});
