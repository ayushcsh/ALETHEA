   "use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const extractText = action({
  args: { url: v.string(), fileName: v.string() },

  handler: async (_, { url, fileName }) => {
    console.log("Inside extractText action");
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const res = await fetch(`https://stanniferous-unsnagged-lanette.ngrok-free.dev/api/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, fileName }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Text extraction failed: ${error}`);
    }

    const data = await res.json();
    return data.text;
  },
});
