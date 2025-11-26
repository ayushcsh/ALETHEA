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
