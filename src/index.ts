import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import authRouter from "./routes/auth/index.js";

const app = new OpenAPIHono();

app.route("/auth", authRouter);

app.get("/", (c) => {
  return c.text("Server is alive!");
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

app.doc("/openapi", {
  openapi: "3.0.0",
  info: {
    version: "0.0.1",
    title: "Backend for a hackathon management system",
  },
});

app.get("/docs", swaggerUI({ url: "/openapi" }));

serve({
  fetch: app.fetch,
  port,
});
