import type { NextAuthConfig } from "next-auth";

const authConfig = {
  trustHost: true,
  providers: [],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.workspaceId = user.workspaceId;
      }

      return token;
    },

    async session({ session, token }) {
      if (
        session.user &&
        typeof token.userId === "string" &&
        typeof token.role === "string" &&
        typeof token.workspaceId === "string"
      ) {
        session.user.id = token.userId;
        session.user.role = token.role as
          | "ADMIN"
          | "ANALYST"
          | "VIEWER";
        session.user.workspaceId = token.workspaceId;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;