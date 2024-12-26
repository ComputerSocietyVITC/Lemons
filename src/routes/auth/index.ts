import { OpenAPIHono } from "@hono/zod-openapi";
import { v4 } from "uuid";
import jwt from "jsonwebtoken";

import prisma from "./../../lib/prisma-client.js";
import { checkPassword, hashPassword } from "./../../utils/passwords.js";
import { login, register } from "./routes.js";

const authRouter = new OpenAPIHono();

authRouter.openapi(login, async (ctx) => {
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
    return ctx.text("User not found", 204);
  }

  const truePassword = await checkPassword(password, auth?.password);

  if (truePassword) {
    if (!process.env.JWT_SECRET) {
      return ctx.text("Internal server error", 500);
    }

    const token = jwt.sign(
      { userId: auth.id, role: auth.user?.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "2h" }
    );

    return ctx.json(
      {
        token: token,
        userId: auth.id,
      },
      200
    );
  } else {
    return ctx.text("Invalid password", 403);
  }
});

authRouter.openapi(register, async (ctx) => {
  const { name, role, email, password, regNum, phone, college } =
    ctx.req.valid("json");

  const existingUser = await prisma.auth.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return ctx.text("User already exists", 409);
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
        regNum,
        phone,
        college,
        id: auth.id,
        authId: auth.id,
      },
    });

    return auth;
  });

  const token = jwt.sign(
    { userId: auth.id, role: role },
    process.env.JWT_SECRET as string,
    { expiresIn: "2h" }
  );

  return ctx.json(
    {
      token: token,
      userId: auth.id,
    },
    201
  );
});

export default authRouter;
