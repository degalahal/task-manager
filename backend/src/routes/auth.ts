
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default async function authRoutes(app: FastifyInstance) {
  // REGISTER
  app.post("/register", async (request, reply) => {
    const result = registerSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        message: "Invalid registration details",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return reply.code(409).send({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return reply.code(201).send({
      message: "Registration successful",
      user,
    });
  });

  // LOGIN
  app.post("/login", async (request, reply) => {
    const result = loginSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        message: "Invalid login details",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return reply.code(401).send({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordMatches) {
      return reply.code(401).send({
        message: "Invalid email or password",
      });
    }

    const token = app.jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      {
        expiresIn: "1h",
      },
    );

    reply.setCookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 3600,
    });

    return reply.code(200).send({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  });

  // GET CURRENT USER
  app.get("/me", async (request, reply) => {
    try {
      const token = request.cookies.token;

      if (!token) {
        return reply.code(401).send({
          message: "Authentication required",
        });
      }

      const decoded = app.jwt.verify<{
        sub: string;
        email: string;
      }>(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      if (!user) {
        return reply.code(401).send({
          message: "User not found",
        });
      }

      return reply.code(200).send({ user });
    } catch {
      return reply.code(401).send({
        message: "Invalid or expired authentication token",
      });
    }
  });
}
