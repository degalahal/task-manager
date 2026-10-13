import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../lib/auth.js";

export default async function adminRoutes(app: FastifyInstance) {
  app.get("/users", async (request, reply) => {
    const allowed = await requireAdmin(request, reply);

    if (!allowed) {
      return;
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return reply.code(200).send({ users });
  });
}