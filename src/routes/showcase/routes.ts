import { z, createRoute } from "@hono/zod-openapi";
import { ProjectSchema } from "../../schemas/project.js";

export const getProjectsShowcase = createRoute({
  method: "get",
  path: "/projects",
  tags: ["Showcase"],
  responses: {
    200: {
      description: "Successfully retrieved all projects.",
      content: {
        "application/json": {
          schema: z.array(ProjectSchema),
        },
      },
    },
    500: {
      description: "Unexpected server error.",
    },
  },
});
