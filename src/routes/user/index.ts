import { OpenAPIHono } from "@hono/zod-openapi";

import prisma from "./../../lib/prisma-client.js";
import {
  deleteUserById,
  getAllUsers,
  getUser,
  getUserById,
  promoteUser,
  updateUser,
} from "./routes.js";
import { Role, Prisma } from "@prisma/client";
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

userRouter.openapi(deleteUserById, async (ctx) => {
  if (!checkRole([Role.ADMIN, Role.SUPER_ADMIN], ctx)) {
    return ctx.text("Forbidden", 403);
  }

  const id = ctx.req.param().id;

  const user = await prisma.auth.delete({
    where: {
      id,
    },
  });

  if (!user) {
    return ctx.text("User not found", 404);
  }

  return ctx.text(`User ${id} deleted successfully`, 200);
});

userRouter.openapi(updateUser, async (ctx) => {
  const id = ctx.req.param().id;
  const uid = ctx.get("jwtPayload").userId;
  if (!checkRole([Role.ADMIN, Role.SUPER_ADMIN], ctx) && id !== uid) {
    return ctx.text("Forbidden", 403);
  }
  const { name, regNum, phone, college, github, imageId } =
    ctx.req.valid("json");

  try {
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        regNum,
        phone,
        college,
        github,
        imageId,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return ctx.text("User not found", 404);
      }
      if (e.code === "P2002") {
        return ctx.text("One or more field(s) conflicts with other users", 409);
      }
    }
    throw e;
  }
  return ctx.text("User updated successfully", 201);
});

userRouter.openapi(promoteUser, async (ctx) => {
  const id = ctx.req.param().id;
  if (!checkRole([Role.SUPER_ADMIN], ctx)) {
    return ctx.text("Forbidden", 403);
  }
  const { role } = ctx.req.valid("json");

  try {
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        role,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return ctx.text("User not found", 404);
      }
    }
    throw e;
  }
  return ctx.text("User role updated successfully", 201);
});
export default userRouter;
