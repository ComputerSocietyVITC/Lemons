import { z, createRoute } from "@hono/zod-openapi";
import { UserSchema } from "../../schemas/user.js";
import { Role } from "@prisma/client";

export const getUser = createRoute({
  method: "get",
  path: "/",
  tags: ["Users"],
  description:
    "Will fetch the currently authenticated user from database. Can be USER, EVALUATOR, ADMIN or SUPER_ADMIN.",
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    200: {
      description: "Retrieved user successfully.",
      content: {
        "application/json": {
          schema: UserSchema.openapi("UserResponse"),
        },
      },
    },
    404: {
      description: "User not found.",
    },
  },
});

export const verifyToken = createRoute({
  method: "get",
  path: "/verify",
  tags: ["Users"],
  description:
    "Will check the validity of JWT token of currently authenticated user. Can be USER, EVALUATOR, ADMIN or SUPER_ADMIN.",
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    200: {
      description: "Token verified.",
    },
    401: {
      description: "Token absent or unverified (possibly expired).",
    },
  },
});

export const getUserById = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Users"],
  description:
    "Fetches the user with specified ID from database. Can be accessed by EVALUATOR, ADMIN, SUPER_ADMIN.",
  security: [
    {
      Bearer: [],
    },
  ],
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
      description: "Retrieved user successfully.",
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
    },
    403: {
      description: "Forbidden. User does not have sufficient permissions.",
    },
    404: {
      description: "User not found.",
    },
  },
});

export const getAllUsers = createRoute({
  method: "get",
  path: "/all",
  tags: ["Users"],
  description:
    "Fetches a list of all users from the database. Can be accessed only by ADMIN and SUPER_ADMIN.",
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    200: {
      description: "Retrieved all users.",
      content: {
        "application/json": {
          schema: z.array(UserSchema),
        },
      },
    },
    403: {
      description: "Forbidden. User does not have sufficient permissions.",
    },
  },
});

export const deleteUserById = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Users"],
  description:
    "Deletes user with specified ID from the database. Can be accessed only by ADMIN and SUPER_ADMIN.",
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    params: z.object({
      id: z
        .string()
        .uuid()
        .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
  },
  responses: {
    201: {
      description: "Deleted user successfully.",
    },
    403: {
      description: "Forbidden. User does not have sufficient permissions.",
    },
    404: {
      description: "User not found.",
    },
  },
});

export const promoteUser = createRoute({
  method: "post",
  path: "/promote/{id}",
  tags: ["Users"],
  description:
    "Promote user with specified ID to a specified role. Can be accessed only by SUPER_ADMIN",
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    params: z.object({
      id: z
        .string()
        .uuid()
        .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            role: z.nativeEnum(Role).openapi({ example: "ADMIN" }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "User role updated successfully.",
    },
    403: {
      description: "Forbidden. User does not have sufficient permissions.",
    },
    404: {
      description: "User not found.",
    },
  },
});

export const updateUser = createRoute({
  method: "post",
  path: "/{id}",
  tags: ["Users"],
  description:
    "Update the user with specified ID. Can be accessed by ADMIN, SUPER_ADMIN and the USER authenticated with the same ID.",
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    params: z.object({
      id: z
        .string()
        .uuid()
        .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().optional().openapi({ example: "Example Name" }),
            regNum: z.string().optional().openapi({ example: "23BRS1369" }),
            phone: z.string().optional().openapi({ example: "1234567890" }),
            college: z
              .string()
              .optional()
              .openapi({ example: "Example College" }),
            github: z
              .string()
              .optional()
              .openapi({ example: "https://github.com/libkush" }),
            imageId: z
              .string()
              .optional()
              .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
            mimeType: z.string().optional().openapi({ example: "png" }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "User updated successfully.",
    },
    403: {
      description: "Forbidden. User does not have sufficient permissions.",
    },
    409: {
      description: "One or more field(s) conflict(s) with other users.",
    },
    500: {
      description: "JWT secret not set.",
    },
  },
});
