import { z, createRoute } from "@hono/zod-openapi";
import { TeamSchema } from "../../schemas/team.js";

export const getAllTeams = createRoute({
  method: "get",
  path: "/all",
  tags: ["Teams"],
  description:
    "Fetches the list of all teams from the database. Can be accessed by ADMIN, SUPER_ADMIN and EVALUATOR.",
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
  tags: ["Teams"],
  description:
    "Authenticated will join team with specified ID, can be accessed only by USER",
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
  tags: ["Teams"],
  description:
    "User will leave whatever team they are a part of. Can be accessed only by USER.",
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
  tags: ["Teams"],
  description:
    "Removes a user with specified id from whatever team he is a part of. Can be accessed by ADMIN, SUPER_ADMIN and USER who is the leader of the specified user's team.",
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
  tags: ["Teams"],
  description:
    "Gets the team with specified ID. Can be accessed by ADMIN, SUPER_ADMIN, EVALUATOR and USER who is a part of the same team.",
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
          schema: TeamSchema.openapi("TeamResponse"),
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
  tags: ["Teams"],
  description:
    "Creates a new team. Can be accessed only by ADMIN, SUPER_ADMIN and USER who isn't a part of any team.",
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
  tags: ["Teams"],
  description:
    "Deletes team with specified ID from the database. Can be accessed by ADMIN and SUPER_ADMIN only.",
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
