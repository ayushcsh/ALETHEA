import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

const context_messages = 10;

// save a message to the db
export const saveMessage = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.optional(v.id("users")),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("AI")),
    sources: v.optional(v.array(v.string())),
  },

  handler: async (ctx, { chatId, userId, content, role, sources }) => {
    const message = await ctx.db.insert("messages", {
      chatId,
      userId,
      content,
      role,
      sources,
      createdAt: Date.now(),
    });

    return message;
  },
});

export const getMessages = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, { chatId }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .order("asc")
      .collect();

    return messages;
  },
});

export const insert = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.optional(v.id("users")),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("AI")),
    sources: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { chatId, userId, content, role, sources }) => {
    const message = await ctx.db.insert("messages", {
      chatId,
      userId,
      content,
      role,
      sources,
      createdAt: Date.now(),
    });

    return message;
  },

});

export const updateChatTitle = mutation({
  args: {
    chatId: v.id("chats"),
    newTitle: v.string(),
  },
  handler: async (ctx, { chatId, newTitle }) => {
    await ctx.db.patch(chatId, { title: newTitle });
  },
});
// send user inputs to the AI and get a response
export const sendMessageToAi = action({
  args: {
    chatId: v.id("chats"),
    userId: v.optional(v.id("users")),
    message: v.string(),
    pdfId: v.optional(v.id("pdfs")),
  },
  handler: async (ctx, { chatId, userId, message, pdfId }) => {
    // store the user message
    if (!userId) throw new Error("User ID is required");
    await ctx.runMutation(api.sendMessage.insert, {
      chatId,
      userId: userId,
      content: message,
      role: "user",
    });

    // get the last few messages as context
    const prevMessages = await ctx.runQuery(api.sendMessage.getMessages, {
      chatId,
    });
    
    if (prevMessages.length < 5 ) {
      const newTitle = message.length > 50
        ? message.slice(0, 50) + "..." // limit title length
        : message;
      await ctx.runMutation(api.sendMessage.updateChatTitle, {
        chatId,
        newTitle,
      });
    }

    const messagesForAI = prevMessages.map((m) => ({
      role: m.role === "user" ? "user" : "AI",
      content: m.content,
    })) as { role: "user" | "AI"; content: string }[];

    // fetch embeddings from the pdf. The chat's own pdfId is authoritative —
    // the client-supplied pdfId comes from localStorage and can drift when
    // the user has multiple chats/PDFs, so fall back to it only if the chat
    // itself has none recorded.
    const chat = await ctx.runQuery(api.chatid.getChatById, { chatId });
    const effectivePdfId = chat?.pdfId ?? pdfId;

    let relevantChunks: string[] = [];
    let sources: string[] = [];
    console.log("PDF ID:", effectivePdfId);
    if (effectivePdfId) {
      const result = await ctx.runAction(internal.embedings.getvectorembeddings, {
        pdfId: effectivePdfId,
        queryText: message,
        topK: 3,
      });
      relevantChunks = result.chunks;

      // The chat's PDF is always the source being discussed, regardless of
      // whether a specific chunk carried its fileName — show it every time.
      const pdf = await ctx.runQuery(internal.embedings.getid, {
        pdfId: effectivePdfId,
      });
      sources = pdf?.fileName ? [pdf.fileName] : result.sources;
    }

    console.log("Relevant Chunks:", relevantChunks);

    //  call the ai and send all the context and recieve the message
    let aiResponse = "";
    aiResponse = await ctx.runAction(api.ai.aiMessage, {
      prevMessages: messagesForAI,
      relevantChunks,
      userMessage: message,
    });
    // store the ai message
    await ctx.runMutation(api.sendMessage.insert, {
      chatId,
      userId: userId,
      content: aiResponse,
      role: "AI",
      sources,
    });

    return { answer: aiResponse, sources };
  },
});
