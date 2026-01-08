import GitHubProvider from "next-auth/providers/github";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Setup Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userId = await convex.mutation(
          api.users.createUserIfNotExists,
          {
            name: user.name || "Unknown",
            email: user.email || "unknown@example.com",
            image: user.image || null,
          }
        );

        token.convexUserId = userId;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.convexUserId && session.user) {
        session.user.id = token.convexUserId;
      }
      return session;
    },
  },
};
