import { OpenAPIHono } from "@hono/zod-openapi";

import prisma from "./../../lib/prisma-client.js";
import { getUser, getUserById } from "./routes.js";

import { Role } from "@prisma/client";
import { checkRole, getCurrentUser } from "../../lib/auth-provider.js";

const userRouter = new OpenAPIHono();

userRouter.openapi(getUser, async (ctx) => {
  const user = getCurrentUser(ctx);
  return new Response(JSON.stringify({ user }), { status: 200 });
});

userRouter.openapi(getUserById, async (ctx) => {
  if (checkRole([Role.USER], ctx)) {
    return new Response("Unauthorized", {
      status: 403,
    });
  }

  const id = ctx.req.param().id;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return new Response("User not found", {
      status: 404,
    });
  }

  return new Response(JSON.stringify({ user }), { status: 200 });
});

export default userRouter;
