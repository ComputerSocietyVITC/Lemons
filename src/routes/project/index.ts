import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../lib/prisma-client.js";
import{
createProject,
getAllProjects,
getProject,
updateProject,
deleteProject,

} from "./routes.js"
import { checkRole, getCurrentUser } from "../../lib/auth-provider.js";
import { Prisma } from "@prisma/client";
import teamRouter from "../teams/index.js";

const projectRouter = new OpenAPIHono();

projectRouter.openapi(createProject, async (ctx) => {
  const { name, description, imageId, teamId } = ctx.req.valid("json");

  if (!checkRole(["SUPER_ADMIN", "ADMIN"], ctx)) {
    return ctx.text("Forbidden", 403);
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        imageId,
        teamId,
      },
    });
    return ctx.json(project, 201);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return ctx.text("Project with this name or imageId already exists", 409);
    }
    throw e;
  }
});

projectRouter.openapi(getAllProjects, async (ctx) => {
  if (!checkRole(["SUPER_ADMIN", "ADMIN", "EVALUATOR"], ctx)) {
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

  if (!checkRole(["SUPER_ADMIN", "ADMIN", "USER"], ctx)) {
    return ctx.text("Forbidden", 403);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: true,
    },
  });

  if (!project) {
    return ctx.text("Project not found", 404);
  }

  return ctx.json(project, 200);
});

projectRouter.openapi(updateProject, async (ctx) => {
  const projectId = ctx.req.param("id");
  const { name, description, imageId } = ctx.req.valid("json");

  if (!checkRole(["SUPER_ADMIN", "ADMIN"], ctx)) {
    return ctx.text("Forbidden", 403);
  }

  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        description,
        imageId,
      },
    });
    return ctx.json(updatedProject, 200);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return ctx.text("Project not found", 404);
    }
    throw e;
  }
});

projectRouter.openapi(deleteProject, async (ctx) => {
  const projectId = ctx.req.param("id");

  if (!checkRole(["SUPER_ADMIN", "ADMIN"], ctx)) {
    return ctx.text("Forbidden", 403);
  }

  try {
    await prisma.project.delete({
      where: { id: projectId },
    });
    return ctx.text("Project deleted successfully", 200);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return ctx.text("Project not found", 404);
    }
    throw e;
  }
});

export default projectRouter;


  