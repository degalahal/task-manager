
import Fastify from "fastify";

const app = Fastify({
  logger: true,
});

app.get("/health", async () => {
  return {
    status: "ok",
    message: "Task Manager API is running",
  };
});

const start = async () => {
  try {
    await app.listen({
      port: 4000,
      host: "127.0.0.1",
    });

    console.log("Backend running at http://127.0.0.1:4000");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
