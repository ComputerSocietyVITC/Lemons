import { z, createRoute } from "@hono/zod-openapi";
import { EvaluationSchema } from "../../schemas/evaluation.js";

export const createEvaluation = createRoute({
  method: "put",
  path: "/",
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
            score: z.number().min(0).max(10).openapi({
              description: "Score for the evaluation, between 0 and 10",
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
  responses: {
    200: {
      description: "List of evaluations",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              id: z.string().uuid(),
              createdAt: z.string(),
              updatedAt: z.string(),
              projectId: z.string().uuid(),
              score: z.number(),
            })
          ),
          example: [
            {
              id: "281b0d6b-3983-4028-b875-d581483826d0",
              createdAt: "2024-12-29T15:13:41.000Z",
              updatedAt: "2024-12-29T12:41:42.372Z",
              projectId: "f47c9e99-10a9-4c12-8a8b-2f14ef9a9cba",
              score: 8,
            },
          ],
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
  request: {
    params: z.object({
      id: z.string().uuid().openapi({
        example: "f47c9e99-10a9-4c12-8a8b-2f14ef9a9cba",
      }),
    }),
  },
  responses: {
    200: {
      description: "Evaluation retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            id: z.string().uuid(),
            createdAt: z.string(),
            updatedAt: z.string(),
            projectId: z.string().uuid(),
            score: z.number(),
            project: z.object({
              id: z.string().uuid(),
              createdAt: z.string(),
              updatedAt: z.string(),
              name: z.string(),
              description: z.string(),
              imageId: z.string().nullable(),
              teamId: z.string().uuid(),
            }),
          }),
          example: {
            id: "281b0d6b-3983-4028-b875-d581483826d0",
            createdAt: "2024-12-29T15:13:41.000Z",
            updatedAt: "2024-12-29T12:41:42.372Z",
            projectId: "f47c9e99-10a9-4c12-8a8b-2f14ef9a9cba",
            score: 8,
            project: {
              id: "f47c9e99-10a9-4c12-8a8b-2f14ef9a9cba",
              createdAt: "2024-12-29T00:03:29.000Z",
              updatedAt: "2024-12-29T00:03:31.000Z",
              name: "volcano",
              description: "cool project",
              imageId: null,
              teamId: "61ca173c-ad68-4cb7-8131-1eb428cf01dc",
            },
          },
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
