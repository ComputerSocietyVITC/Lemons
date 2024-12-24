import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { v4 } from "uuid";
import jwt from "jsonwebtoken";

import prisma from "./../../lib/prisma-client.js";
import { checkPassword, hashPassword } from "./../../utils/passwords.js";

const authRouter = new Hono();

authRouter.post(
  "/login",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
    })
  ),
  async (ctx) => {
    const { email, password } = ctx.req.valid("json");

    const auth = await prisma.auth.findUnique({
      where: {
        email,
      },
      include: {
        user: true,
      },
    });

    if (!auth) {
      return new Response("User not found", {
        status: 404,
      });
    }

    const truePassword = await checkPassword(password, auth?.password);

    if (truePassword) {
      if (!process.env.JWT_SECRET) {
        return new Response("Internal server error", { status: 500 });
      }

      const token = jwt.sign(
        { userId: auth.id, role: auth.user?.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "2h" }
      );

      return new Response(
        JSON.stringify({
          token: token,
          userId: auth.id,
        })
      );
    } else {
      return new Response("Invalid password", {
        status: 403,
      });
    }
  }
);

authRouter.post(
  "/register",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      role: z.enum(["ADMIN", "USER"]),
      email: z.string().email(),
      password: z.string().min(8),
    })
  ),
  async (ctx) => {
    const { name, role, email, password } = ctx.req.valid("json");

    const existingUser = await prisma.auth.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return new Response("User already exists", {
        status: 409,
      });
    }

    const hashedPassword = await hashPassword(password);

    const auth = await prisma.$transaction(async (tx) => {
      const auth = await tx.auth.create({
        data: {
          id: v4(),
          email,
          password: hashedPassword,
        },
      });

      await tx.user.create({
        data: {
          name,
          role,
          authId: auth.id,
        },
      });

      return auth;
    });

    return new Response(
      JSON.stringify({
        message: "User registered successfully",
        user: auth,
      }),
      {
        status: 201,
      }
    );
  }
);

export default authRouter;
