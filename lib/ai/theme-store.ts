import { db } from "@/lib/db";

export async function resolveWorkspaceThemes(
  workspaceId: string,
  themeNames: string[],
) {
  const normalizedNames = Array.from(
    new Set(
      themeNames
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  ).slice(0, 5);

  const resolved = [];

  for (const name of normalizedNames) {
    const theme = await db.theme.upsert({
      where: {
        workspaceId_name: {
          workspaceId,
          name,
        },
      },
      update: {},
      create: {
        workspaceId,
        name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    resolved.push(theme);
  }

  return resolved;
}
