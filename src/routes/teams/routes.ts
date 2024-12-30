import { z, createRoute } from "@hono/zod-openapi";
import { TeamSchema } from "../../schemas/team";

export const getTeam = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      description: "All teams retrieved successfully",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              team: TeamSchema,
            })
          ),
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
  request: {
    params: z.object({
      id: z.string().uuid(),
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
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string(),
            imageId: z.string().uuid(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Team created successfully",
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
  request: {
    params: z.object({
      name: z.string(),
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
