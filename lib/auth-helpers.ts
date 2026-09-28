import { auth } from "@/lib/auth";

export type AuthenticatedUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  workspaceId: string;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const session = await auth();

  if (!session?.user?.id || !session.user.workspaceId || !session.user.role) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    role: session.user.role,
    workspaceId: session.user.workspaceId,
  };
}

export function hasRole(
  user: AuthenticatedUser,
  allowedRoles: AuthenticatedUser["role"][],
): boolean {
  return allowedRoles.includes(user.role);
}

export function requireRole(
  user: AuthenticatedUser,
  allowedRoles: AuthenticatedUser["role"][],
): void {
  if (!hasRole(user, allowedRoles)) {
    throw new Error("FORBIDDEN");
  }
}