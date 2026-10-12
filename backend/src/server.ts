
import cors from "@fastify/cors";
import Fastify from "fastify";
import authRoutes from "./routes/auth.js";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import "dotenv/config";
import taskRoutes from "./routes/tasks.js";
const app = Fastify({
  logger: true,

});
await app.register(cors, {
  origin: "http://localhost:3000",
  credentials: true,
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

app.get("/health", async () => {
  return {
    status: "ok",
    message: "Deepak's Task Manager API is running",
  };
});
const port = Number(process.env.PORT) || 4000;

const start = async () => {
  try {
    await app.listen({
      port,
      host: "127.0.0.1",
    });

    console.log("Deepak's Backend running at http://127.0.0.1:4000");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
