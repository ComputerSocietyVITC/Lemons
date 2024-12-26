import { Context, Next } from "hono";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

interface JWTPayload {
  userId: string;
  role: Role | undefined;
}

export const authMiddleware = async (ctx: Context, next: Next) => {
  const authHeader = ctx.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ctx.json({ message: "Unauthorized - No token provided" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JWTPayload;

    ctx.set("user", decoded);
    await next();
  } catch {
    return ctx.json({ message: "Unauthorized - Invalid token" }, 401);
  }
};

export const requireRole = (allowedRoles: Role[]) => {
  return async (ctx: Context, next: Next) => {
    const user = ctx.get("user") as JWTPayload;

    if (!user.role || !allowedRoles.includes(user.role)) {
      return ctx.json(
        {
          message: "Forbidden - Insufficient permissions",
        },
        403
      );
    }

    await next();
  };
};

export const refreshToken = async (ctx: Context) => {
  const user = getCurrentUser(ctx);
  const newToken = jwt.sign(
    { userId: user.userId, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "2h" }
  );
  return ctx.json({ token: newToken });
};

export const getCurrentUser = (ctx: Context): JWTPayload => {
  return ctx.get("user");
};
