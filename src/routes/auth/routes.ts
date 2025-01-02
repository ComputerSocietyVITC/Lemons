import { z, createRoute } from "@hono/zod-openapi";
import { Role } from "@prisma/client";

export const login = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z
              .string()
              .email()
              .openapi({ example: "example@example.com" }),
            password: z.string().min(8).openapi({ example: "password" }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "User logged in successfully",
      content: {
        "application/json": {
          schema: z
            .object({
              token: z.string().openapi({
                example:
                  "eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTczNTE0MDk3NiwiaWF0IjoxNzM1MTQwOTc2fQ",
              }),
              userId: z
                .string()
                .openapi({ example: "c9d2841e-7696-4360-bce4-9f9f3e2469cd" }),
            })
            .openapi("TokenResponse"),
        },
      },
    },
    403: {
      description: "Invalid password",
    },
    404: {
      description: "User not found",
    },
    500: {
      description: "JWT secret not set",
    },
  },
});

export const register = createRoute({
  method: "post",
  path: "/register",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().openapi({ example: "Example Name" }),
            role: z.nativeEnum(Role).openapi({ example: "USER" }),
            regNum: z.string().openapi({ example: "23BRS1369" }),
            phone: z.string().openapi({ example: "1234567890" }),
            college: z.string().openapi({ example: "Example College" }),
            email: z
              .string()
              .email()
              .openapi({ example: "example@example.com" }),
            password: z.string().min(8).openapi({ example: "password" }),
          }),
        },
      },
    },
  },

  responses: {
    201: {
      description: "User registered successfully",
    },
    409: {
      description: "User already exists",
    },
    500: {
      description: "JWT secret not set",
    },
  },
});
