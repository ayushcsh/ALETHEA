    // /convex/schema.ts
    import { defineSchema, defineTable } from "convex/server";
    import { v } from "convex/values";


    export default defineSchema({
    users : defineTable({
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
        pdfId : v.id("pdfs"),
        chunk : v.string(),
        embedding : v.array(v.float64()),
        createdAt: v.number(),
    }).index("by_pdf", ["pdfId"])
     .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["pdfId"],
    }),

    chats: defineTable({
        chatId : v.string(),
        userId : v.id("users"),
        pdfId: v.optional(v.id("pdfs")),
        title: v.optional(v.string()),
        pdfUrl : v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_user", ["userId"]
    
    ),

    messages: defineTable({
        chatId: v.id("chats"),
        userId : v.optional(v.id("users")),
        content: v.string(),
        role: v.string(),
        createdAt: v.number(),
    }).index("by_chat", ["chatId"]),    
    });