import { Role } from "@prisma/client";
import { Context, Next } from "hono";
import jwt from "jsonwebtoken";

interface JWTPayload {
  userId: string;
  role: Role;
}

export const middleware = async (ctx: Context, next: Next) => {
  let authHeader = ctx.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ctx.json({ message: "Unauthorized - No token provided" }, 401);
  }

  authHeader = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      authHeader,
      process.env.JWT_SECRET as string
    ) as JWTPayload;

    ctx.set("user", decoded);
    ctx.set("role", decoded.role);
    await next();
  } catch {
    ctx.status(401);
    ctx.json({ message: "Unauthorized - Invalid token" });
    return;
  }
};

export const checkRole = (roles: Role[], ctx: Context) => {
  if (!roles.includes(ctx.get("role"))) {
    return false;
  }

  return true;
};

export const getCurrentUser = (ctx: Context) => {
  return ctx.get("user");
};
