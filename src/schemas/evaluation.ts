import { z } from "@hono/zod-openapi";

export const EvaluationSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  createdAt: z.string().datetime().openapi({ example: "2021-08-01T00:00:00Z" }),
  updatedAt: z.string().datetime().openapi({ example: "2021-08-01T00:00:00Z" }),
  projectId: z
    .string()
    .uuid()
    .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  score: z.number().openapi({ example: 10 }),
});
