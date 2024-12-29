import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../lib/prisma-client.js";
import {
  createEvaluation,
  getEvaluation,
  getEvaluationById,
  deleteEvaluation,
} from "./route.js";
import { checkRole } from "../../lib/auth-provider.js";
import { Role } from "@prisma/client";
import { middleware } from "../../lib/auth-provider.js";
const evaluationRouter = new OpenAPIHono();

interface JWTPayload {
  userId: string;
  role: Role;
  exp: number;
}
declare module "hono" {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}
evaluationRouter.use("*", middleware);

// PUT /evaluations - Entering the scores for a project
evaluationRouter.openapi(createEvaluation, async (ctx) => {
  const { projectId, score } = ctx.req.valid("json");
  try {
    const allowedRoles: Role[] = ["SUPER_ADMIN", "EVALUATOR"];
    if (!checkRole(allowedRoles, ctx)) {
      return ctx.text("You do not have permission to create evaluations", 403);
    }

    if (score < 0 || score > 10) {
      return ctx.text("Score must be between 0 and 10", 400);
    }
    await prisma.evaluation.updateMany({
      where: { projectId },
      data: { score },
    });

    return ctx.json("Record updated", 201);
  } catch (error) {
    console.error("Error occurred:", error);

    //Foreign key constraint error
    if ((error as { code?: string }).code === "P2003") {
      return ctx.text("Invalid project ID - Project does not exist", 400);
    }
    return ctx.text("An unexpected error occurred", 500);
  }
});

// GET /evaluations - Get all evaluations
evaluationRouter.openapi(getEvaluation, async (ctx) => {
  try {
    const allowedRoles: Role[] = ["SUPER_ADMIN", "EVALUATOR", "ADMIN", "USER"];

    const user = ctx.get("user");

    if (!user || !user.userId) {
      console.log("Unauthorized - No user ID found", user);
      return ctx.text("Unauthorized - No user ID found", 401);
    }

    const fetchedUser = await prisma.user.findUnique({
      where: { authId: user.userId },
      include: { team: { include: { project: true } } },
    });

    if (!fetchedUser) {
      return ctx.text("Unauthorized - User not found", 401);
    }

    if (!allowedRoles.includes(fetchedUser.role)) {
      return ctx.text("You do not have permission to view evaluations", 403);
    }

    // Restrict evaluations for the USER role to only their project
    let evaluations;
    if (fetchedUser.role === "USER") {
      if (!fetchedUser.team?.project) {
        return ctx.text("No project associated with the user's team", 404);
      }

      const evaluations = await prisma.evaluation.findMany({
        where: { projectId: fetchedUser.team.project.id },
        select: {
          score: true,
        },
      });
      return ctx.json(evaluations, 200);
    } else {
      evaluations = await prisma.evaluation.findMany();
    }

    return ctx.json(evaluations, 200);
  } catch (error) {
    console.error("Error occurred:", error);
    return ctx.text("An unexpected error occurred", 500);
  }
});

// GET /evaluations/:id - Get a specific evaluation by ID
evaluationRouter.openapi(getEvaluationById, async (ctx) => {
  const id = ctx.req.param("id");

  try {
    const allowedRoles: Role[] = ["SUPER_ADMIN", "EVALUATOR", "ADMIN"];
    if (!checkRole(allowedRoles, ctx)) {
      return ctx.text("You do not have permission to view evaluations", 403);
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: {
        id,
      },
    });

    if (!evaluation) {
      return ctx.text("Evaluation not found", 404);
    }

    return ctx.json(evaluation, 200);
  } catch (error) {
    console.error("Error occurred:", error);
    return ctx.text("An unexpected error occurred", 500);
  }
});

// DELETE /evaluations/:id - Delete a specific evaluation by ID
evaluationRouter.openapi(deleteEvaluation, async (ctx) => {
  const id = ctx.req.param("id");

  try {
    const allowedRoles: Role[] = ["SUPER_ADMIN", "EVALUATOR"];
    if (!checkRole(allowedRoles, ctx)) {
      return ctx.text("You do not have permission to delete evaluations", 403);
    }

    await prisma.evaluation.delete({
      where: {
        id,
      },
    });

    return ctx.json("The entry has been deleted", 200);
  } catch (error) {
    console.error("Error occurred:", error);
    return ctx.text("An unexpected error occurred", 500);
  }
});

export default evaluationRouter;
