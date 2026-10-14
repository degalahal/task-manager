
import cors from "@fastify/cors";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import "dotenv/config";
import { env } from "./config/env.js";

import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import adminRoutes from "./routes/admin.js";

const app = Fastify({
  logger: true,
});

const origin = env.ORIGIN;

await app.register(cors, {
  origin,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

await app.register(cookie);

await app.register(jwt, {
  secret: env.JWT_SECRET,
});

// General rate limit. Authentication routes will have stricter limits.
await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

app.register(authRoutes, { prefix: "/api/auth" });
app.register(taskRoutes, { prefix: "/api/tasks" });
app.register(adminRoutes, { prefix: "/api/admin" });

app.get("/health", async () => {
  return {
    status: "ok",
    message: "Task Manager API is running",
  };
});

const port = env.PORT;
const host = env.HOST;

const start = async () => {
  try {
    await app.listen({ port, host });
    app.log.info(`Backend running at http://${host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
