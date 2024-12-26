import { z } from "@hono/zod-openapi";
import { Role } from "@prisma/client";

export const UserSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  createdAt: z.string().datetime().openapi({ example: "2021-08-01T00:00:00Z" }),
  updatedAt: z.string().datetime().openapi({ example: "2021-08-01T00:00:00Z" }),
  authId: z
    .string()
    .uuid()
    .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  name: z.string().openapi({ example: "John Doe" }),
  role: z.nativeEnum(Role).openapi({ example: "USER" }),
  regNum: z.string().openapi({ example: "19BCE1234" }),
  phone: z.string().openapi({ example: "9876543210" }),
  college: z.string().openapi({ example: "VIT" }),
  github: z
    .string()
    .optional()
    .openapi({ example: "https://github.com/example" }),
  imageId: z
    .string()
    .optional()
    .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  isLeader: z.boolean().openapi({ example: true }),
  teamId: z
    .string()
    .uuid()
    .optional()
    .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
});
