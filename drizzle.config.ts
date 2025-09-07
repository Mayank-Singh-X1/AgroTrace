import type { Config } from "drizzle-kit";
import { resolve } from "path";

export default {
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: resolve("./sqlite.db")
  }
} satisfies Config;
