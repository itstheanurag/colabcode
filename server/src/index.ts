import { Hono } from "hono";
import { cors } from "hono/cors";
import { getSocketServerUrl, initSocket } from "./socket";

const app = new Hono();

const { collabPort } = initSocket();

app.use("*", cors());

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/status", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    bunVersion: Bun.version,
    collabPort,
    collabServerUrl: getSocketServerUrl(),
  });
});

export default {
  port: 3000,
  fetch: app.fetch,
};
