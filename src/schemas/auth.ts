import { z } from "@hono/zod-openapi";
import { UserSchema } from "./user.js";

export const AuthSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  createdAt: z.string().datetime().openapi({ example: "2021-08-01T00:00:00Z" }),
  updatedAt: z.string().datetime().openapi({ example: "2021-08-01T00:00:00Z" }),
  email: z.string().email().openapi({ example: "example@example.com" }),
  password: z.string().openapi({ example: "password" }),
  user: UserSchema.optional(),
});
