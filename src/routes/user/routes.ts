import { z, createRoute } from "@hono/zod-openapi";
import { UserSchema } from "../../schemas/user.js";

export const getUser = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      description: "Retrieved user successfully",
      content: {
        "application/json": {
          schema: z
            .object({
              user: UserSchema,
            })
            .openapi("UserResponse"),
        },
      },
    },
    404: {
      description: "User not found",
    },
  },
});

export const getUserById = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: z.object({
      id: z
        .string()
        .uuid()
        .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
  },
  responses: {
    200: {
      description: "Retrieved user successfully",
      content: {
        "application/json": {
          schema: z
            .object({
              user: UserSchema,
            })
            .openapi("UserResponse"),
        },
      },
    },
    404: {
      description: "User not found",
    },
  },
});
