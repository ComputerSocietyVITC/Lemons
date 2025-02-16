import { OpenAPIHono } from "@hono/zod-openapi";

import prisma from "../../lib/prisma-client.js";
import {
  getCurrentTeam,
  getAllTeams,
  getTeam,
  createTeam,
  deleteTeam,
  joinTeam,
  leaveTeam,
  removeUser,
} from "./routes.js";

import { Prisma } from "@prisma/client";
import { checkRole, getCurrentUser } from "../../lib/auth-provider.js";

const teamRouter = new OpenAPIHono();

teamRouter.openapi(getCurrentTeam, async (ctx) => {
  if (!checkRole(["USER"], ctx)) {
    return ctx.text("Forbidden", 403);
  }
  const user = await prisma.user.findUnique({
    where: { id: getCurrentUser(ctx).userId },
  });
  if (!user) {
    return ctx.text("User not found", 404);
  }
  if (!user.teamId) {
    return ctx.text("User not a part of any team", 404);
  }
  const team = await prisma.team.findUnique({
    where: { id: user.teamId },
    include: {
      members: true,
    },
  });
  return ctx.json(team, 200);
});

teamRouter.openapi(createTeam, async (ctx) => {
  const { name, imageId } = ctx.req.valid("json");
  if (!checkRole(["SUPER_ADMIN", "ADMIN", "USER"], ctx)) {
    return ctx.text("Forbidden", 403);
  }
  const user = await prisma.user.findUnique({
    where: { id: getCurrentUser(ctx).userId },
  });
  if (!user) {
    return ctx.text("User not found", 404);
  }
  if (user.teamId) {
    return ctx.text("Requested user is a member of an existing team", 409);
  }
  const team = await prisma.team.create({
    data: {
      name: name,
      imageId: imageId,
    },
    include: {
      members: true,
      project: true,
    },
  });
  if (user?.role == "USER") {
    await prisma.user.update({
      where: { id: user?.id },
      data: {
        teamId: team.id,
        isLeader: true,
      },
    });
  }
  return ctx.json(team, 201);
});

teamRouter.openapi(getAllTeams, async (ctx) => {
  if (!checkRole(["SUPER_ADMIN", "ADMIN", "EVALUATOR"], ctx)) {
    return ctx.text("Forbidden", 403);
  }
  const teams = await prisma.team.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      members: true,
      project: true,
    },
  });
  return ctx.json(teams, 200);
});

teamRouter.openapi(getTeam, async (ctx) => {
  const teamId = ctx.req.param("id");
  const user = getCurrentUser(ctx);
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: true,
      project: true,
    },
  });
  if (user.role === "USER") {
    const fetchedUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { team: true },
    });
    if (teamId !== fetchedUser?.team?.id) {
      return ctx.text("Forbidden", 403);
    }
  }
  if (!team) {
    return ctx.text("Team not found", 404);
  }
  return ctx.json(team, 200);
});

teamRouter.openapi(joinTeam, async (ctx) => {
  if (!checkRole(["USER"], ctx)) {
    return ctx.text("Only users can join a team", 403);
  }
  const user = await prisma.user.findUnique({
    where: { id: getCurrentUser(ctx).userId },
  });
  if (!user) {
    return ctx.text("User not found", 404);
  }
  if (user.teamId) {
    return ctx.text("You are already part of a team", 409);
  }
  const id = ctx.req.param("id");
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        teamId: id,
        isLeader: false,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2003") {
        return ctx.text("Team not found", 404);
      }
    }
    throw e;
  }
  return ctx.text("Joined team successfully", 201);
});

teamRouter.openapi(leaveTeam, async (ctx) => {
  if (!checkRole(["USER"], ctx)) {
    return ctx.text("Only users can leave a team", 403);
  }
  const user = await prisma.user.findUnique({
    where: { id: getCurrentUser(ctx).userId },
  });
  if (!user) {
    return ctx.text("User not found", 404);
  }
  if (!user.teamId) {
    return ctx.text("You are not a part of any team", 409);
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      teamId: null,
      isLeader: false,
    },
  });
  return ctx.text("Left team successfully", 201);
});

teamRouter.openapi(removeUser, async (ctx) => {
  const id = ctx.req.param("id");
  const user = getCurrentUser(ctx);
  if (!checkRole(["SUPER_ADMIN", "ADMIN", "USER"], ctx)) {
    return ctx.text("Forbidden", 403);
  }
  if (user.role === "USER") {
    const fetchedUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { team: true },
    });
    if (id !== fetchedUser?.team?.id || !fetchedUser?.isLeader) {
      return ctx.text("Forbidden", 403);
    }
  }
  const { userId } = ctx.req.valid("json");
  await prisma.user.update({
    where: { id: userId },
    data: {
      teamId: null,
      isLeader: false,
    },
  });
  return ctx.text("User removed successfully", 201);
});

teamRouter.openapi(deleteTeam, async (ctx) => {
  const id = ctx.req.param("id");
  if (!checkRole(["SUPER_ADMIN", "ADMIN"], ctx)) {
    return ctx.text("Forbidden", 403);
  }
  try {
    await prisma.team.delete({
      where: { id },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return ctx.text("Team not found", 404);
      }
    }
    throw e;
  }
  return ctx.text("Team deleted successfully", 201);
});

export default teamRouter;
