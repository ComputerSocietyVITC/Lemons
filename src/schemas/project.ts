import { z } from "@hono/zod-openapi";
import { EvaluationSchema } from "./evaluation.js";

export const ProjectSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  createdAt: z.string().datetime().openapi({ example: "2021-08-01T00:00:00Z" }),
  updatedAt: z.string().datetime().openapi({ example: "2021-08-01T00:00:00Z" }),
  name: z.string().openapi({ example: "Project Name" }),
  description: z.string().openapi({ example: "Project Description" }),
  imageId: z
    .string()
    .optional()
    .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  teamId: z
    .string()
    .uuid()
    .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  evaluations: z.array(EvaluationSchema),
});
