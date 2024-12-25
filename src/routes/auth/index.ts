import { OpenAPIHono } from "@hono/zod-openapi";
import { v4 } from "uuid";
import jwt from "jsonwebtoken";

import prisma from "./../../lib/prisma-client.js";
import { checkPassword, hashPassword } from "./../../utils/passwords.js";
import { login, register } from "./routes.js";

const authRouter = new OpenAPIHono();

authRouter.openapi(login, async (ctx) => {
  const { email, password } = ctx.req.valid("query");

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
      }),
      { status: 200 }
    );
  } else {
    return new Response("Invalid password", {
      status: 403,
    });
  }
});

authRouter.openapi(register, async (ctx) => {
  const { name, role, email, password } = ctx.req.valid("query");

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
      userId: auth.id,
    }),
    {
      status: 201,
    }
  );
});

export default authRouter;
