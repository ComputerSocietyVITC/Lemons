import { OpenAPIHono } from "@hono/zod-openapi";

import prisma from "../../lib/prisma-client.js";
import { getTeam, getTeamById, createTeam, deleteTeam } from "./routes.js";

import { Role } from "@prisma/client";
import { checkRole, getCurrentUser } from "../../lib/auth-provider.js";

const teamRouter = new OpenAPIHono();

teamRouter.openapi(createTeam, async (ctx) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: getCurrentUser(ctx).id },
    });
    const allowedRoles: Role[] = ["SUPER_ADMIN", "ADMIN"];
    const { name, imageId } = ctx.req.valid("json");

    if (!checkRole(allowedRoles, ctx) && !user?.isLeader) {
      return ctx.text("Unauthorized", 403);
    }

    await prisma.team.create({
      data: {
        name: name,
        imageId: imageId,
      },
    });

    return ctx.text("Team created successfully.", 200);
  } catch (error) {
    console.error("Error occurred", error);
    return ctx.text("An unexpected error occurred", 500);
  }
});

teamRouter.openapi(getTeam, async (ctx) => {
  try {
    if (checkRole([Role.USER], ctx)) {
      return ctx.text("Unauthorized", 403);
    }

    const teams = await prisma.team.findMany();

    if (!teams) {
      return ctx.text("No teams have registered", 404);
    }

    return ctx.json({ teams }, 200);
  } catch (error) {
    console.error("Error occurred", error);
    return ctx.text("An unexpected error occurred", 500);
  }
});

teamRouter.openapi(getTeamById, async (ctx) => {
  try {
    const teamId = ctx.req.param("id");
    const user = getCurrentUser(ctx);

    if (user.role === "USER") {
      const fetchedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { team: true },
      });

      if (!fetchedUser?.team) {
        return ctx.text("You are not part of any team", 404);
      }

      if (teamId !== fetchedUser.team.id) {
        return ctx.text("You do not have permission to view other teams", 403);
      }

      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      return ctx.json(team, 200);
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return ctx.text("Team not found", 404);
    }

    return ctx.json({ team }, 200);
  } catch (error) {
    console.error("Error occurred", error);
    return ctx.text("An unexpected error occurred", 500);
  }
});

teamRouter.openapi(deleteTeam, async (ctx) => {
  try {
    const allowedRoles: Role[] = ["SUPER_ADMIN"];

    if (!checkRole(allowedRoles, ctx)) {
      return ctx.text("Unauthorized", 403);
    }

    const id = ctx.req.param("id");

    if ((await prisma.team.findUnique({ where: { id } })) == null) {
      return ctx.text("Team not found", 404);
    }

    await prisma.team.delete({
      where: { id },
    });

    return ctx.text("Team deleted successfully.", 200);
  } catch (error) {
    console.error("Error occurred", error);
    return ctx.text("An unexpected error occurred", 500);
  }
});

export default teamRouter;
