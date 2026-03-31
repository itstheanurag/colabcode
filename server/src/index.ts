import { Hono } from "hono";
import { initSocket } from "./socket";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/status", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    bunVersion: Bun.version,
  });
});

const socketHandler = initSocket();

export default {
  port: 3000,
  async fetch(req: Request, server: any) {
    const res = await socketHandler.fetch(req, server);
    if (res && res.status !== 404) return res;
    return app.fetch(req, server);
  },
  websocket: socketHandler.websocket,
};
