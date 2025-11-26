import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// --- Get user by email ---
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", email))
      .first();
  },
});

// --- Create user if not exists ---
export const createUserIfNotExists = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, { name, email, image }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", email))
      .first();

    if (existingUser) return existingUser._id;

    const userId = await ctx.db.insert("users", {
      name,
      email,
      createdAt: Date.now(),
    });

    return userId;
  },
});

export async function getCurrentUserOrThrow(ctx : any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("User not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", identity.email))
    .unique();

  if (!user) throw new Error("User not found in database");
  return user;
}