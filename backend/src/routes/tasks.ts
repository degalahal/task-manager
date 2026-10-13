
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireUser } from "../lib/auth.js";

// Validate dates in YYYY-MM-DD format.
const deadlineSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Deadline must be a valid date")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "Deadline must be a valid calendar date");

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional(),
  deadline: deadlineSchema.optional(),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  deadline: deadlineSchema.nullable().optional(),
});

const taskRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/tasks — list the logged-in user's tasks
  app.get("/", async (request, reply) => {
    const userId = await requireUser(request, reply);
    if (!userId) return;

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return reply.code(200).send(tasks);
  });

  // POST /api/tasks — create a task for the logged-in user
  app.post("/", async (request, reply) => {
    const userId = await requireUser(request, reply);
    if (!userId) return;

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
        description: parsed.data.description?.trim() || null,
        deadline: parsed.data.deadline
          ? new Date(`${parsed.data.deadline}T00:00:00.000Z`)
          : null,
        userId,
      },
    });

    return reply.code(201).send(task);
  });

  // PATCH /api/tasks/:id — update only an owned task
  app.patch("/:id", async (request, reply) => {
    const userId = await requireUser(request, reply);
    if (!userId) return;

    const { id } = request.params as { id: string };
    const parsed = updateTaskSchema.safeParse(request.body);

    if (
      !parsed.success ||
      Object.keys(parsed.data ?? {}).length === 0
    ) {
      return reply.code(400).send({
        message: "Invalid task update",
        ...(parsed.success
          ? {}
          : { errors: parsed.error.flatten() }),
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
        ...(parsed.data.deadline !== undefined && {
          deadline: parsed.data.deadline
            ? new Date(`${parsed.data.deadline}T00:00:00.000Z`)
            : null,
        }),
      },
    });

    if (result.count === 0) {
      return reply.code(404).send({
        message: "Task not found",
      });
    }

    const updatedTask = await prisma.task.findFirst({
      where: { id, userId },
    });

    return reply.code(200).send(updatedTask);
  });

  // DELETE /api/tasks/:id — delete only an owned task
  app.delete("/:id", async (request, reply) => {
    const userId = await requireUser(request, reply);
    if (!userId) return;

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
