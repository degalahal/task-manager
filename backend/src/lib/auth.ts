import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "./prisma.js";

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
):
 Promise<boolean> {
  try {
    const token = request.cookies.token;

    if (!token) {
      reply.code(401).send({
        message: "Authentication required",
      });
      return false;
    }

    const decoded = request.server.jwt.verify<{
      sub: string;
      email: string;
    }>(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true },
    });

    if (!user) {
      reply.code(401).send({
        message: "User not found",
      });
      return false;
    }

    if (user.role !== "ADMIN") {
      reply.code(403).send({
        message: "Admin access required",
      });
      return false;
    }

    return true;
  } catch {
    reply.code(401).send({
      message: "Invalid or expired authentication token",
    });
    return false;
  }
}

export async function requireUser(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<string | null> {
  try {
    const token = request.cookies.token;

    if (!token) {
      reply.code(401).send({ message: "Authentication required" });
      return null;
    }

    const decoded = request.server.jwt.verify<{ sub: string }>(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true },
    });

    if (!user) {
      reply.code(401).send({ message: "User not found" });
      return null;
    }

    return user.id;
  } catch {
    reply.code(401).send({
      message: "Invalid or expired authentication token",
    });
    return null;
  }
}
