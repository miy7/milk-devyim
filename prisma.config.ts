import "dotenv/config";

import { defineConfig } from "prisma/config";

import { getDatabaseUrl } from "./lib/database-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: getDatabaseUrl(),
  },
  migrations: {
    seed: "node prisma/seed.js",
  },
});
