import { prisma } from "../../src/database/index.js";

export async function clearDatabase() {
  // Get all user tables in public schema
  const tables: Array<{ tablename: string }> = await prisma.$queryRawUnsafe(
    `select tablename from pg_tables where schemaname='public'`
  );

  const tableNames = tables
    .map((t) => t.tablename)
    .filter((n) => n !== "_prisma_migrations" && n !== "tenants")
    .sort();

  if (tableNames.length === 0) return;

  const quoted = tableNames.map((t) => `"${t}"`).join(",");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
