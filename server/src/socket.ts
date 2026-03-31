import { Server } from "socket.io";
import { Server as Engine } from "@socket.io/bun-engine";
import { YSocketIO } from "y-socket.io/dist/server";

export const initSocket = () => {
  const io = new Server({
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const engine = new Engine({
    path: "/socket.io/",
  });
  
  io.bind(engine);

  // Initialize y-socket.io
  const ysocketio = new YSocketIO(io);
  ysocketio.initialize();

  io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);
    
    socket.on("disconnect", () => {
      console.log("user disconnected:", socket.id);
    });
  });

  // Return the handler object which includes fetch and websocket properties
  return engine.handler();
};
