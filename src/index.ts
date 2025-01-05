import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import authRouter from "./routes/auth/index.js";
import userRouter from "./routes/user/index.js";
import teamRouter from "./routes/teams/index.js";
import evaluationRouter from "./routes/evalutation/index.js";
import { jwt } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";

type Variables = JwtVariables;

const app = new OpenAPIHono<{ Variables: Variables }>();
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

app.route("/auth", authRouter);

app.get("/", (c) => {
  return c.text("Server is alive!");
});

app.doc("/openapi", {
  openapi: "3.0.0",
  info: {
    version: "0.0.1",
    title: "Backend for a hackathon management system",
  },
});

app.get("/docs", swaggerUI({ url: "/openapi" }));

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT Token not set");
}
app.use(
  "*",
  jwt({
    secret: secret,
  })
);

app.route("/user", userRouter);
app.route("/teams", teamRouter);
app.route("/evaluation", evaluationRouter);

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);
serve({
  fetch: app.fetch,
  port,
});
