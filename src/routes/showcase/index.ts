import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../lib/prisma-client.js";
import { getProjectsShowcase } from "./routes.js";

const showcaseRouter = new OpenAPIHono();

showcaseRouter.openapi(getProjectsShowcase, async (ctx) => {
  const projects = await prisma.project.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return ctx.json(projects, 200);
});

export default showcaseRouter;
