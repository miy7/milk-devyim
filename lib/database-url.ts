const LOCAL_FALLBACK_URL =
  "postgresql://postgres:postgres@localhost:5432/milk_devyim?schema=public";

export function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.PRISMA_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    LOCAL_FALLBACK_URL
  );
}
