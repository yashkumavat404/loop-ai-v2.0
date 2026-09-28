import type { NextAuthConfig } from "next-auth";

const authConfig = {
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
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as
          | "ADMIN"
          | "ANALYST"
          | "VIEWER";
        session.user.workspaceId = token.workspaceId as string;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;