import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../lib/prisma-client.js";
import {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
} from "./routes.js";
import { checkRole, getCurrentUser } from "../../lib/auth-provider.js";
import { Role, Prisma } from "@prisma/client";

const projectRouter = new OpenAPIHono();

projectRouter.openapi(createProject, async (ctx) => {
  const { name, description, teamId } = ctx.req.valid("json");

  if (!checkRole([Role.SUPER_ADMIN, Role.ADMIN, Role.USER], ctx)) {
    return ctx.text("Forbidden", 403);
  }

  const user = getCurrentUser(ctx);
  if (checkRole([Role.USER], ctx)) {
    const fetchedUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { team: true },
    });
    if (teamId !== fetchedUser?.team?.id || !fetchedUser?.isLeader) {
      return ctx.text("Forbidden", 403);
    }
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        teamId,
      },
    });
    return ctx.json(project, 201);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return ctx.text("Project with this name or imageId already exists", 409);
    }
    throw e;
  }
});

projectRouter.openapi(getAllProjects, async (ctx) => {
  if (!checkRole([Role.SUPER_ADMIN, Role.ADMIN, Role.EVALUATOR], ctx)) {
    return ctx.text("Forbidden", 403);
  }

  const projects = await prisma.project.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      team: true,
    },
  });

  return ctx.json(projects, 200);
});

projectRouter.openapi(getProject, async (ctx) => {
  const projectId = ctx.req.param("id");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: true,
    },
  });

  const user = getCurrentUser(ctx);
  if (checkRole([Role.USER], ctx)) {
    const fetchedUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { team: true },
    });
    if (project?.teamId !== fetchedUser?.team?.id) {
      return ctx.text("Forbidden", 403);
    }
  }

  if (!project) {
    return ctx.text("Project not found", 404);
  }

  return ctx.json(project, 200);
});

projectRouter.openapi(updateProject, async (ctx) => {
  const projectId = ctx.req.param("id");
  const { name, description, repoUrl, demoUrl, reportUrl, imageId } =
    ctx.req.valid("json");

  if (!checkRole([Role.SUPER_ADMIN, Role.ADMIN, Role.USER], ctx)) {
    return ctx.text("Forbidden", 403);
  }
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: true,
    },
  });
  const user = getCurrentUser(ctx);
  if (checkRole([Role.USER], ctx)) {
    const fetchedUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { team: true },
    });
    if (project?.teamId !== fetchedUser?.team?.id) {
      return ctx.text("Forbidden", 403);
    }
  }

  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        description,
        repoUrl,
        demoUrl,
        reportUrl,
        imageId,
      },
    });
    return ctx.json(updatedProject, 200);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return ctx.text("Project not found", 404);
    }
    throw e;
  }
});

projectRouter.openapi(deleteProject, async (ctx) => {
  const projectId = ctx.req.param("id");

  if (!checkRole([Role.SUPER_ADMIN, Role.ADMIN], ctx)) {
    return ctx.text("Forbidden", 403);
  }

  try {
    await prisma.project.delete({
      where: { id: projectId },
    });
    return ctx.text("Project deleted successfully", 200);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return ctx.text("Project not found", 404);
    }
    throw e;
  }
});

export default projectRouter;
