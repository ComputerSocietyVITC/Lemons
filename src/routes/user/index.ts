import { OpenAPIHono } from "@hono/zod-openapi";

import prisma from "./../../lib/prisma-client.js";
import { getAllUsers, getUser, getUserById } from "./routes.js";

import { Role } from "@prisma/client";
import { checkRole, getCurrentUser } from "../../lib/auth-provider.js";

const userRouter = new OpenAPIHono();

userRouter.openapi(getUser, async (ctx) => {
  const user = getCurrentUser(ctx);
  return ctx.json(user, 200);
});

userRouter.openapi(getAllUsers, async (ctx) => {
  if (!checkRole([Role.ADMIN, Role.SUPER_ADMIN], ctx)) {
    return ctx.text("Forbidden", 403);
  }
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return ctx.json(users);
});

userRouter.openapi(getUserById, async (ctx) => {
  if (checkRole([Role.USER], ctx)) {
    return ctx.text("Unauthorized", 403);
  }

  const id = ctx.req.param().id;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return ctx.text("User not found", 404);
  }

  return ctx.json({ user }, 200);
});

export default userRouter;
