import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "ANALYST" | "VIEWER";
      workspaceId: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "ANALYST" | "VIEWER";
    workspaceId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: "ADMIN" | "ANALYST" | "VIEWER";
    workspaceId?: string;
  }
}