import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyB9a_JSdEZuiwLN9xkLQmV5v_HbQXb_jTY");

export const aiMessage = action({
  args: {
    prevMessages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("AI")),
        content: v.string(),
      })
    ),
    relevantChunks: v.array(v.string()),
    userMessage: v.string(),
  },
  handler: async (ctx, { prevMessages, relevantChunks, userMessage }) => {
    const buildMessages = (
      prevMessages: Array<{ role: "user" | "AI"; content: string }>,
      relevantChunks: string[],
      userMessage: string
    ) => {
      const context = relevantChunks.length
        ? `Context from relevant documents:\n\n${relevantChunks.join("\n\n")}\n\n`
        : "";

      const history = prevMessages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      return [
        ...history,
        {
          role: "user",
          parts: [{ text: `${context}${userMessage}` }],
        },
      ];
    };
    
    

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const messages = buildMessages(prevMessages, relevantChunks, userMessage);

      const result = await model.generateContent({ contents: messages });
      return result.response.text();
    } catch (err) {
      console.error("Error calling AI:", err);
      throw new Error("AI request failed");
    }
  },
});
