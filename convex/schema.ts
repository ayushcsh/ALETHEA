// /convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  pdfs: defineTable({
    userId: v.optional(v.id("users")),
    title: v.string(),
    fileName: v.string(),
    storageId: v.id("_storage"),
    contentType: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  pdfembeddings: defineTable({
    pdfId: v.id("pdfs"),
    chatId: v.optional(v.id("chats")),
    chunk: v.string(),
    embedding: v.array(v.float64()),
    createdAt: v.number(),
    fileName: v.optional(v.string()),
    chunkIndex: v.optional(v.number()),
    documentId: v.optional(v.string()),
    page: v.optional(v.number()),
  })
    .index("by_pdf", ["pdfId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["pdfId", "chatId"],
    }),

  chats: defineTable({
    chatId: v.string(),
    userId: v.id("users"),
    pdfId: v.optional(v.id("pdfs")),
    title: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  chatDocuments: defineTable({
    chatId: v.id("chats"),
    pdfId: v.id("pdfs"),
    pdfUrl: v.string(),
    fileName: v.string(),
    addedAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_pdf", ["pdfId"]),

  messages: defineTable({
    chatId: v.id("chats"),
    userId: v.optional(v.id("users")),
    content: v.string(),
    role: v.string(),
    sources: v.optional(v.array(v.string())),
    createdAt: v.number(),
  }).index("by_chat", ["chatId"]),
});
