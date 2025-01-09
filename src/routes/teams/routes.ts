import { z, createRoute } from "@hono/zod-openapi";
import { TeamSchema } from "../../schemas/team.js";

export const getAllTeams = createRoute({
  method: "get",
  path: "/all",
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    200: {
      description: "Successfully retrieved all teams.",
      content: {
        "application/json": {
          schema: z.array(TeamSchema),
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

export const joinTeam = createRoute({
  method: "post",
  path: "/{id}/join",
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
    201: {
      description: "Joined team successfully.",
    },
    403: {
      description: "Forbidden. User does not have sufficient permissions.",
    },
    404: {
      description: "Team not found.",
    },
    409: {
      description: "User is a member of an existing team.",
    },
    500: {
      description: "Unexpected server error.",
    },
  },
});

export const leaveTeam = createRoute({
  method: "delete",
  path: "/leave",
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    201: {
      description: "Left team successfully.",
    },
    403: {
      description: "Forbidden. User does not have sufficient permissions.",
    },
    409: {
      description: "User is not a member of any existing team.",
    },
    500: {
      description: "Unexpected server error.",
    },
  },
});

export const removeUser = createRoute({
  method: "delete",
  path: "/{id}/remove",
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
            userId: z.string().uuid().openapi({
              example: "123e4567-e89b-12d3-a456-426614174000",
            }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Requested user removed from team successfully.",
    },
    403: {
      description: "Forbidden. User does not have sufficient permissions.",
    },
    500: {
      description: "Unexpected server error.",
    },
  },
});

export const getTeam = createRoute({
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
      description: "Successfully retrieved team.",
      content: {
        "application/json": {
          schema: TeamSchema,
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

export const createTeam = createRoute({
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
      description: "Team created successfully.",
      content: {
        "application/json": {
          schema: TeamSchema,
        },
      },
    },
    403: {
      description: "Forbidden. User does not have sufficient permissions.",
    },
    404: {
      description: "User not found.",
    },
    500: {
      description: "Unexpected server error.",
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
      id: z.string().uuid().openapi({
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
    }),
  },
  responses: {
    200: {
      description: "Team deleted successfully.",
    },
    403: {
      description: "forbidden. user does not have sufficient permissions.",
    },
    404: {
      description: "Team not found.",
    },
    500: {
      description: "Unexpected server error.",
    },
  },
});
