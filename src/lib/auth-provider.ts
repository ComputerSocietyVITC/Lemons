import { Role } from "@prisma/client";
import { Context, Next } from "hono";
import { verify } from "hono/jwt";

export const middleware = async (ctx: Context, next: Next) => {
  let authHeader = ctx.req.header("Authorization");

  if (!process.env.JWT_SECRET) {
    return ctx.text("Internal server error", 500);
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ctx.json({ message: "Unauthorized - No token provided" }, 401);
  }

  authHeader = authHeader.split(" ")[1];

  try {
    const decoded = (await verify(authHeader, process.env.JWT_SECRET)) as {
      userId: string;
      role: Role;
      exp: number;
    };

    ctx.set("user", decoded);
    await next();
  } catch (error) {
    if (error instanceof Error && error.name === "JwtTokenExpired") {
      ctx.status(401);
      return ctx.json({ message: "Unauthorized - Token expired" });
    }
    ctx.status(401);
    return ctx.json({ message: "Unauthorized - Invalid token" });
  }
};

export const checkRole = (roles: Role[], ctx: Context) => {
  if (!roles.includes(ctx.get("user").role)) {
    return false;
  }

  return true;
};

export const getCurrentUser = (ctx: Context) => {
  return ctx.get("user");
};
