import { prisma } from "../../src/database/index.js";

export default async function globalTeardown() {
  try {
    await prisma.$disconnect();
  } catch (e) {
    // ignore
  }
}
