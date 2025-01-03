import { OpenAPIHono } from "@hono/zod-openapi";
import { v4 } from "uuid";
import { sign } from "hono/jwt";
import prisma from "./../../lib/prisma-client.js";
import { checkPassword, hashPassword } from "./../../utils/passwords.js";
import { login, register } from "./routes.js";

const authRouter = new OpenAPIHono();

authRouter.openapi(login, async (ctx) => {
  const { email, password } = ctx.req.valid("json");

  if (!process.env.JWT_SECRET) {
    return ctx.text("Internal server error", 500);
  }

  const auth = await prisma.auth.findUnique({
    where: {
      email,
    },
    include: {
      user: true,
    },
  });

  if (!auth) {
    return ctx.text("User not found", 404);
  }

  const truePassword = await checkPassword(password, auth?.password);

  if (truePassword) {
    const token = await sign(
      {
        userId: auth.id,
        role: auth.user?.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // Token expires in 2h
      },
      process.env.JWT_SECRET
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

  if (!process.env.JWT_SECRET) {
    return ctx.text("Internal server error", 500);
  }

  const [existingAuth, existingUser] = await prisma.$transaction([
    prisma.auth.findUnique({
      where: { email },
    }),
    prisma.user.findFirst({
      where: {
        OR: [{ regNum }, { phone }],
      },
    }),
  ]);

  console.log(existingAuth, existingUser);
  if (existingAuth || existingUser) {
    return ctx.text("User already exists", 409);
  }

  const hashedPassword = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
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

  return ctx.text("User registered successfully", 201);
});

export default authRouter;
