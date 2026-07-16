import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./server/socket-handlers";

const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });

app.prepare().then(() => {
  const handler = app.getRequestHandler();

  const httpServer = createServer((req, res) => {
    handler(req, res);
  });

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    registerSocketHandlers(io, socket);
  });

  httpServer.listen(3000);
});
