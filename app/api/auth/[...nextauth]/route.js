import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
// ✅ Setup Convex client 
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],

  callbacks: {
    // 🧠 Runs when JWT is created or updated
    async jwt({ token, user }) {
      if (user) {
        // create/find user in Convex DB
        const userId = await convex.mutation(api.users.createUserIfNotExists, {
          name: user.name || "Unknown",
          email: user.email || "unknown@example.com",
          image: user.image || null,
        });

        token.convexUserId = userId;
      }
      return token;
    },

    // 🧩 Attach convexUserId to session.user.id
    async session({ session, token }) {
      if (token?.convexUserId) {
        session.user.id = token.convexUserId;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
