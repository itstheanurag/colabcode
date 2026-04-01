import { Server } from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";

type YjsDocumentInfo = {
  name: string;
};

const DEFAULT_COLLAB_PORT = 3001;

let io: Server | null = null;
let collabPort = DEFAULT_COLLAB_PORT;

const getCollabPort = () => {
  const envPort = Number(process.env.COLLAB_PORT);
  return Number.isInteger(envPort) && envPort > 0 ? envPort : DEFAULT_COLLAB_PORT;
};

export const initSocket = () => {
  if (io) {
    return { io, collabPort };
  }

  collabPort = getCollabPort();

  io = new Server({
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io/",
    transports: ["websocket"],
  });

  const ysocketio = new YSocketIO(io);
  ysocketio.initialize();

  ysocketio.on("document-loaded", (doc: YjsDocumentInfo) => {
    console.log("Yjs document loaded:", doc.name);
  });

  ysocketio.on("document-update", (doc: YjsDocumentInfo) => {
    console.log("Yjs document updated:", doc.name);
  });

  ysocketio.on("all-document-connections-closed", (doc: YjsDocumentInfo) => {
    console.log("All clients disconnected from document:", doc.name);
  });

  ysocketio.nsp?.on("connection", (socket) => {
    console.log(
      "Yjs socket connected:",
      socket.id,
      "namespace:",
      socket.nsp.name,
    );

    socket.on("disconnect", (reason) => {
      console.log(
        "Yjs socket disconnected:",
        socket.id,
        "namespace:",
        socket.nsp.name,
        "reason:",
        reason,
      );
    });
  });

  io.listen(collabPort);
  console.log(`Socket.IO collaboration server running on port ${collabPort}`);

  return { io, collabPort };
};

export const getSocketServerUrl = () => `http://localhost:${collabPort}`;
