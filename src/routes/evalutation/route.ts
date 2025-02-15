import { z, createRoute } from "@hono/zod-openapi";
import { EvaluationSchema } from "../../schemas/evaluation.js";

export const createEvaluation = createRoute({
  method: "post",
  path: "/",
  tags: ["Evaluations"],
  description:
    "Fetches an evaluation from the database. Can be accessed by SUPER_ADMIN and EVALUATOR.",
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z
            .object({
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
            })
            .openapi("EvaluationResponse"),
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
    401: {
      description: "Unauthorized. User is not logged in.",
    },
    403: {
      description: "Forbidden. User does not have sufficient permissions.",
    },
    404: {
      description: "Project not found.",
    },
    500: {
      description: "Unexpected server error.",
    },
  },
});

export const getEvaluation = createRoute({
  method: "get",
  path: "/",
  tags: ["Evaluations"],
  description:
    "Fetches all evaluations from the database. Can be accessed by ADMIN, SUPER_ADMIN and EVALUATOR.",
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
      description: "Forbidden. User does not have sufficient permissions.",
    },
    500: {
      description: "Unexpected server error.",
    },
  },
});

export const getEvaluationById = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Evaluations"],
  description:
    "Fetches evaluation with specified ID. Can be accessed by ADMIN, SUPER_ADMIN and EVALUATOR.",
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
      description: "Forbidden. User does not have sufficient permissions.",
    },
    404: {
      description: "Evaluation not found.",
    },
    500: {
      description: "Unexpected server error.",
    },
  },
});

export const deleteEvaluation = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Evaluations"],
  description:
    "Deletes evaluation of specified ID from the database. Can be accessed by ADMIN, SUPER_ADMIN and EVALUATOR.",
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
      description: "Forbidden. User does not have sufficient permissions.",
    },
    404: {
      description: "Evaluation not found.",
    },
    500: {
      description: "Unexpected server error.",
    },
  },
});
