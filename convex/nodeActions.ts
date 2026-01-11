   "use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const extractText = action({
  args: { url: v.string(), fileName: v.string() },

  handler: async (_, { url, fileName }) => {
    console.log("Inside extractText action");
    const apiBase = process.env.NEXT_PUBLIC_API_URL;

    if (!apiBase) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined in environment variables");
    }

    const targetUrl = `${apiBase}/api/extract`;
    console.log(`Sending extraction request to: ${targetUrl}`);

    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, fileName }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Text extraction failed (${res.status} from ${targetUrl}): ${errorText.substring(0, 200)}`);
      }

      const data = await res.json();
      return data.text;
    } catch (err: any) {
      throw new Error(`Fetch error: ${err.message}`);
    }

  },
});
