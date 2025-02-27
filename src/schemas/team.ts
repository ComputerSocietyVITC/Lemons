import { z } from "@hono/zod-openapi";
import { UserSchema } from "./user.js";
import { ProjectSchema } from "./project.js";

export const TeamSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  createdAt: z.string().datetime().openapi({ example: "2021-08-01T00:00:00Z" }),
  updatedAt: z.string().datetime().openapi({ example: "2021-08-01T00:00:00Z" }),
  name: z.string().openapi({ example: "Team Name" }),
  imageId: z
    .string()
    .optional()
    .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  mimeType: z.string().optional().openapi({ example: "png" }),
  members: z.array(UserSchema),
  project: ProjectSchema.optional(),
});
