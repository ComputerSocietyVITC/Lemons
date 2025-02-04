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
import { getCurrentUser } from "../../lib/auth-provider.js";

const evaluationRouter = new OpenAPIHono();

// POST /evaluations - For creating a new evaluation or updating an existing evaluation
evaluationRouter.openapi(createEvaluation, async (ctx) => {
  try {
    const MAX_SCORE = 10;
    const userId = getCurrentUser(ctx).userId;
    const allowedRoles: Role[] = ["SUPER_ADMIN", "EVALUATOR"];

    if (!checkRole(allowedRoles, ctx)) {
      return ctx.text("You do not have permission to manage evaluations", 403);
    }

    const { projectId, score } = ctx.req.valid("json");

    if (score < 0 || score > MAX_SCORE) {
      return ctx.text(
        `Score must be greater than 0 and less than ${MAX_SCORE}`,
        400
      );
    }

    const evaluation = await prisma.evaluation.upsert({
      where: { userId_projectId: { userId, projectId } },
      update: { score },
      create: {
        userId,
        projectId,
        score,
      },
    });
    return ctx.json(evaluation, 201);
  } catch (error) {
    if ((error as { code?: string }).code === "P2003") {
      return ctx.text("Invalid project ID - Project does not exist", 400);
    }
    console.error("Error managing evaluation:", error);
    return ctx.text("An unexpected error occurred", 500);
  }
});

// GET /evaluations - Get all evaluations
evaluationRouter.openapi(getEvaluation, async (ctx) => {
  try {
    const allowedRoles: Role[] = ["SUPER_ADMIN", "EVALUATOR", "ADMIN"];
    if (!checkRole(allowedRoles, ctx)) {
      return ctx.text("You do not have permission to view evaluations", 403);
    } else {
      const evaluations = await prisma.evaluation.findMany();
      return ctx.json(evaluations, 200);
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return ctx.text("An unexpected error occurred", 500);
  }
});

// GET /evaluations/:id - Get a specific evaluation by projectId
evaluationRouter.openapi(getEvaluationById, async (ctx) => {
  try {
    const user = getCurrentUser(ctx);
    if (!user) {
      return ctx.text("User not authenticated", 401);
    }
    const allowedRoles: Role[] = ["SUPER_ADMIN", "EVALUATOR", "ADMIN"];

    if (!checkRole(allowedRoles, ctx)) {
      return ctx.text("Unauthorized access", 403);
    } else {
      const projectId = ctx.req.param("id");

      // Fetch evaluations for the project (applicable for roles other than the User)
      const evaluations = await prisma.evaluation.findMany({
        where: { projectId },
      });

      return ctx.json(evaluations, 200);
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return ctx.text("An unexpected error occurred", 500);
  }
});

// DELETE /evaluations/:id - Delete a specific evaluation by projectId
evaluationRouter.openapi(deleteEvaluation, async (ctx) => {
  try {
    const allowedRoles: Role[] = ["SUPER_ADMIN", "EVALUATOR", "ADMIN"];
    if (!checkRole(allowedRoles, ctx)) {
      return ctx.text("You do not have permission to delete evaluations", 403);
    }

    const projectId = ctx.req.param("id");
    const userId = getCurrentUser(ctx).userId;

    if (!projectId) {
      return ctx.text("Project ID must be provided", 400);
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    if (!evaluation) {
      return ctx.text("Evaluation does not exist", 404);
    }

    await prisma.evaluation.delete({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    return ctx.json("The entry has been deleted", 200);
  } catch (error) {
    console.error("Error occurred:", error);
    return ctx.text("An unexpected error occurred", 500);
  }
});

export default evaluationRouter;
