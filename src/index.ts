import { serve } from "@hono/node-server";
import { Hono } from "hono";

import authRouter from "./routes/auth/index.js";

const app = new Hono();

app.route("/auth", authRouter);

app.get("/", (c) => {
  return c.text("Server is alive!");
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
