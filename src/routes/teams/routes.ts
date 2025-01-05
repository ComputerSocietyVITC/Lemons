import { z, createRoute } from "@hono/zod-openapi";
import { TeamSchema } from "../../schemas/team";

export const getTeam = createRoute({
  method: "get",
  path: "/",
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    200: {
      description: "All teams retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(
              z.object({
                team: TeamSchema,
              })
            ),
          }),
        },
      },
    },
    403: {
      description: "Unauthorized - User does not have permission",
    },
    404: {
      description: "No teams have registered",
    },
    500: {
      description: "Server error",
    },
  },
});

export const getTeamById = createRoute({
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
      description: "Team retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            team: TeamSchema,
          }),
        },
      },
    },
    403: {
      description: "Unauthorized - User does not have permission",
    },
    404: {
      description: "Team not found",
    },
    500: {
      description: "Server error",
    },
  },
});

export const createTeam = createRoute({
  method: "post",
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
            name: z.string().openapi({
              example: "Best Team Evaaa",
            }),
            imageId: z.string().uuid().openapi({
              example: "123e4567-e89b-12d3-a456-426614174000",
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Team created successfully",
      content: {
        "application/json": {
          schema: z.object({
            team: TeamSchema,
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

export const deleteTeam = createRoute({
  method: "delete",
  path: "/{id}",
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    params: z.object({
      name: z.string().openapi({
        example: "Best Team Evaaa",
      }),
    }),
  },
  responses: {
    200: {
      description: "Team deleted successfully",
    },
    403: {
      description: "Unauthorized - User does not have permission",
    },
    404: {
      description: "Team not found",
    },
    500: {
      description: "Server error",
    },
  },
});
