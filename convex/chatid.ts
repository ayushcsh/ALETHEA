import { mutation, query } from "../convex/_generated/server";
import { v } from "convex/values";


export const chatid = mutation({
  args: {
    pdfId: v.optional(v.id("pdfs")),
    userId: v.id("users"),
    title: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
  },
  handler: async (ctx, { userId, pdfId, title,pdfUrl }) => {
    const createdAt = Date.now();
    const chatId = crypto.randomUUID();
    
     const real = await ctx.db.insert("chats", {
      userId,
      pdfId,
      createdAt,
      chatId,
      pdfUrl,
      title,
    });

    return real;
  },
});

export const getChatsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc") 
      .collect();
    
    const filteredChats = chats.filter((chat)=> chat.title !== "N ew Chat");
    return filteredChats.map((chat) => ({
      id: chat._id,
      title: chat.title || "new Chat",
      pdfUrl: chat.pdfUrl,
      createdAt: new Date(chat.createdAt).toLocaleString(),
    }));
  },
});

export const getChatById = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, { chatId }) => {
    return await ctx.db.get(chatId);
  },
});

// 🟦 Get all messages by chatId
export const getMessagesByChatId = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("chatId"), args.chatId))
      .order("asc")
      .collect();
  },
});

// Attach an already-uploaded PDF to a chat
export const attachDocument = mutation({
  args: {
    chatId: v.id("chats"),
    pdfId: v.id("pdfs"),
    pdfUrl: v.string(),
    fileName: v.string(),
  },
  handler: async (ctx, { chatId, pdfId, pdfUrl, fileName }) => {
    return await ctx.db.insert("chatDocuments", {
      chatId,
      pdfId,
      pdfUrl,
      fileName,
      addedAt: Date.now(),
    });
  },
});

// Get every PDF attached to a chat
export const getDocumentsByChat = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, { chatId }) => {
    return await ctx.db
      .query("chatDocuments")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .collect();
  },
});

// Remove a PDF from a chat: deletes its embeddings (so retrieval stops
// using it), the underlying pdf record + stored file, and the link itself.
export const removeDocument = mutation({
  args: {
    documentId: v.id("chatDocuments"),
  },
  handler: async (ctx, { documentId }) => {
    const doc = await ctx.db.get(documentId);
    if (!doc) return;

    const embeddings = await ctx.db
      .query("pdfembeddings")
      .withIndex("by_pdf", (q) => q.eq("pdfId", doc.pdfId))
      .collect();
    for (const embedding of embeddings) {
      await ctx.db.delete(embedding._id);
    }

    const pdf = await ctx.db.get(doc.pdfId);
    if (pdf) {
      await ctx.storage.delete(pdf.storageId);
      await ctx.db.delete(doc.pdfId);
    }

    await ctx.db.delete(documentId);
  },
});

export const deletechat = mutation({
  args:{
    chatId : v.id("chats"),
  },
  handler: async (ctx , {chatId}) =>{
    await ctx.db.delete(chatId);
  }
})

export const renamechat = mutation({
  args:{
    chatId : v.id("chats"),
    title : v.string(),
  }
  ,handler : async (ctx , {chatId , title}) => {
    await ctx.db.patch(chatId , {title});
  }
})
