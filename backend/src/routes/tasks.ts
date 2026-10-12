
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
});

const taskRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/tasks — list the logged-in user's tasks
  app.get("/", async (request, reply) => {
    let userId: string;

    try {
      const token = request.cookies.token;

      if (!token) {
        return reply.code(401).send({
          message: "Authentication required",
        });
      }

      const payload = app.jwt.verify(token) as {
        sub: string;
        email: string;
      };

      userId = payload.sub;
    } catch {
      return reply.code(401).send({
        message: "Authentication required",
      });
    }

    return prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  });

  // POST /api/tasks — create a task
  app.post("/", async (request, reply) => {
    let userId: string;

    try {
      const token = request.cookies.token;

      if (!token) {
        return reply.code(401).send({
          message: "Authentication required",
        });
      }

      const payload = app.jwt.verify(token) as {
        sub: string;
        email: string;
      };

      userId = payload.sub;
    } catch {
      return reply.code(401).send({
        message: "Authentication required",
      });
    }

    const parsed = createTaskSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        message: "Invalid task details",
        errors: parsed.error.flatten(),
      });
    }

    
const task = await prisma.task.create({
  data: {
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    userId,
  },
});


    return reply.code(201).send(task);
  });

  // PATCH /api/tasks/:id — update an owned task
  app.patch("/:id", async (request, reply) => {
    let userId: string;

    try {
      const token = request.cookies.token;

      if (!token) {
        return reply.code(401).send({
          message: "Authentication required",
        });
      }

      const payload = app.jwt.verify(token) as {
        sub: string;
        email: string;
      };

      userId = payload.sub;
    } catch {
      return reply.code(401).send({
        message: "Authentication required",
      });
    }

    const { id } = request.params as { id: string };
    const parsed = updateTaskSchema.safeParse(request.body);

    if (
      !parsed.success ||
      Object.keys(parsed.data ?? {}).length === 0
    ) {
      return reply.code(400).send({
        message: "Invalid task update",
      });
    }

    
const result = await prisma.task.updateMany({
  where: { id, userId },
  data: {
    ...(parsed.data.title !== undefined && {
      title: parsed.data.title,
    }),
    ...(parsed.data.description !== undefined && {
      description: parsed.data.description,
    }),
    ...(parsed.data.status !== undefined && {
      status: parsed.data.status,
    }),
  },
});


    if (result.count === 0) {
      return reply.code(404).send({
        message: "Task not found",
      });
    }

    return prisma.task.findFirst({
      where: { id, userId },
    });
  });

  // DELETE /api/tasks/:id — delete an owned task
  app.delete("/:id", async (request, reply) => {
    let userId: string;

    try {
      const token = request.cookies.token;

      if (!token) {
        return reply.code(401).send({
          message: "Authentication required",
        });
      }

      const payload = app.jwt.verify(token) as {
        sub: string;
        email: string;
      };

      userId = payload.sub;
    } catch {
      return reply.code(401).send({
        message: "Authentication required",
      });
    }

    const { id } = request.params as { id: string };

    const result = await prisma.task.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      return reply.code(404).send({
        message: "Task not found",
      });
    }

    return reply.code(200).send({
      message: "Task deleted successfully",
    });
  });
};

export default taskRoutes;
