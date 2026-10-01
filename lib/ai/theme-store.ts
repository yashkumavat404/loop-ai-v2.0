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

  const existing = await db.theme.findMany({
    where: {
      workspaceId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const byName = new Map(
    existing.map((theme) => [theme.name.toLowerCase(), theme]),
  );

  const resolved = [];

  for (const name of normalizedNames) {
    const existingTheme = byName.get(name.toLowerCase());

    if (existingTheme) {
      resolved.push(existingTheme);
      continue;
    }

    const created = await db.theme.create({
      data: {
        workspaceId,
        name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    byName.set(name.toLowerCase(), created);
    resolved.push(created);
  }

  return resolved;
}
