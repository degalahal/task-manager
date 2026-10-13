
import cors from "@fastify/cors";
import Fastify from "fastify";
import authRoutes from "./routes/auth.js";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import "dotenv/config";
import taskRoutes from "./routes/tasks.js";
import adminRoutes from "./routes/admin.js";
const app = Fastify({
  logger: true,

});
const origin = String(process.env.ORIGIN);

await app.register(cors, {
  origin,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from the .env file");
}

await app.register(cookie);

await app.register(jwt, {
  secret: process.env.JWT_SECRET,
});
app.register(authRoutes, { prefix: "/api/auth" });
app.register(taskRoutes, { prefix: "/api/tasks" });
app.register(adminRoutes, { prefix: "/api/admin" });

app.get("/health", async () => {
  return {
    status: "ok",
    message: "Deepak's Task Manager API is running",
  };
});
const port = Number(process.env.PORT);
const host = String(process.env.HOST);

const start = async () => {
  try {
    await app.listen({
      port,
      host,
    });

    console.log("Deepak's Backend running at http://127.0.0.1:4000");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
