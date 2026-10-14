
import dotenv from "dotenv";

dotenv.config({ override: false });
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  HOST: z.string().trim().min(1).default("127.0.0.1"),

  ORIGIN: z.url().default("http://localhost:3000"),

  DATABASE_URL: z
    .string()
    .trim()
    .min(1, "DATABASE_URL is required"),

  JWT_SECRET: z
    .string()
    .trim()
    .min(32, "JWT_SECRET must contain at least 32 characters"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const errors = result.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment configuration:\n${errors}`);
}

export const env = result.data;
