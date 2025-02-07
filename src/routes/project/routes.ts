import { z, createRoute } from "@hono/zod-openapi";
import { ProjectSchema } from "../../schemas/project.js";

export const getAllProjects = createRoute({
  method: "get",
  path: "/all",
  tags: ["Projects"],
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    200: {
      description: "Successfully retrieved all projects.",
      content: {
        "application/json": {
          schema: z.array(ProjectSchema),
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

export const getProject = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Projects"],
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
      description: "Successfully retrieved project.",
      content: {
        "application/json": {
          schema: ProjectSchema.openapi("ProjectResponse"),
        },
      },
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

export const createProject = createRoute({
  method: "post",
  path: "/",
  tags: ["Projects"],
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
              example: "Project Alpha",
            }),
            description: z.string().openapi({
              example: "This is the first project.",
            }),
            teamId: z.string().openapi({
              example: "123e4567-e89b-12d3-a456-426614174000",
            }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Project created successfully.",
      content: {
        "application/json": {
          schema: ProjectSchema,
        },
      },
    },
    403: {
      description: "Forbidden. User does not have sufficient permissions.",
    },
    409: {
      description: "Conflict. Team has already created a project.",
    },
    500: {
      description: "Unexpected server error.",
    },
  },
});

export const updateProject = createRoute({
  method: "post",
  path: "/{id}",
  tags: ["Projects"],
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
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().optional().openapi({
              example: "Updated Project Name",
            }),
            description: z.string().optional().openapi({
              example: "Updated description for the project.",
            }),
            repoUrl: z.string().optional().openapi({
              example: "https://github.com/ComputerSocietyVITC/Lemons",
            }),
            demoUrl: z.string().optional().openapi({
              example: "https://www.adityajyoti.com/",
            }),
            reportUrl: z.string().optional().openapi({
              example: "https://www.seas.upenn.edu/~zives/03f/cis550/codd.pdf",
            }),
            imageId: z.string().uuid().optional().openapi({
              example: "123e4567-e89b-12d3-a456-426614174000",
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Project updated successfully.",
      content: {
        "application/json": {
          schema: ProjectSchema,
        },
      },
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

export const deleteProject = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Projects"],
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
      description: "Project deleted successfully.",
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
