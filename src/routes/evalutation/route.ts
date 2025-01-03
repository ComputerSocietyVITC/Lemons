import { z, createRoute } from "@hono/zod-openapi";
import { EvaluationSchema } from "../../schemas/evaluation.js";

export const createEvaluation = createRoute({
  method: "put",
  path: "/",
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            projectId: z.string().uuid().openapi({
              description:
                "UUID of the project for which the evaluation is created",
              example: "f47c9e99-10a9-4c12-8a8b-2f14ef9a9cba",
            }),
            score: z.number().openapi({
              description:
                "Score for the evaluation, must be greater than 0 and less than MAX_SCORE",
              example: 8,
            }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Evaluation created successfully",
      content: {
        "application/json": {
          schema: z.object({
            id: z.string().uuid().openapi({
              example: "9bdb42fd-5f35-4c0a-9bcb-9d2f013df01f",
            }),
            projectId: z.string().uuid(),
            score: z.number(),
          }),
        },
      },
    },
    403: {
      description: "Unauthorized - User does not have permission",
    },
    404: {
      description: "Project not found",
    },
    500: {
      description: "Server error",
    },
  },
});

export const getEvaluation = createRoute({
  method: "get",
  path: "/",
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    200: {
      description: "List of evaluations",
      content: {
        "application/json": {
          schema: EvaluationSchema.openapi({
            description: "List of evaluations",
          }),
        },
      },
    },
    403: {
      description: "Unauthorized - User does not have permission",
    },
    500: {
      description: "Server error",
    },
  },
});
export const getEvaluationById = createRoute({
  method: "get",
  path: "/{id}",
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
    }),
  },
  responses: {
    200: {
      description: "Evaluation retrieved successfully",
      content: {
        "application/json": {
          schema: EvaluationSchema.openapi({
            description: "List of evaluations",
          }),
        },
      },
    },
    403: {
      description: "Unauthorized - User does not have permission",
    },
    404: {
      description: "Evaluation not found",
    },
    500: {
      description: "Server error",
    },
  },
});
export const deleteEvaluation = createRoute({
  method: "delete",
  path: "/{id}",
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({
        example: "9bdb42fd-5f35-4c0a-9bcb-9d2f013df01f",
      }),
    }),
  },
  responses: {
    200: {
      description: "Evaluation deleted successfully",
      content: {
        "application/json": {
          schema: EvaluationSchema.openapi({
            description: "Evaluation object",
          }),
        },
      },
    },
    403: {
      description: "Unauthorized - User does not have permission",
    },
    404: {
      description: "Evaluation not found",
    },
    500: {
      description: "Server error",
    },
  },
});
