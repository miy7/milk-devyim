import { defineConfig } from "prisma/config";

const fallbackUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/milk_devyim?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: fallbackUrl,
  },
  migrations: {
    seed: "node prisma/seed.js",
  },
});
