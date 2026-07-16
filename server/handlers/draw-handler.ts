import { Server, Socket } from "socket.io";
import { DrawingPath } from "../types";
import { rooms, broadcastRoomUpdate } from "../state";

export function registerDrawHandlers(io: Server, socket: Socket) {
  
  // Draw Path Event Handler
  socket.on(
    "draw-path",
    ({ roomId, path }: { roomId: string; path: DrawingPath }) => {
      const room = rooms[roomId];
      if (!room) return;

      room.canvasPaths.push(path);
      // Propagate stroke coordinate directly to peers
      socket.to(roomId).emit("path-drawn", path);
    }
  );

  // Undo Draw Event Handler
  socket.on("undo-draw", ({ roomId }: { roomId: string }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.canvasPaths.pop();
    broadcastRoomUpdate(io, roomId);
  });

  // Clear Canvas Event Handler
  socket.on("clear-canvas", ({ roomId }: { roomId: string }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.canvasPaths = [];
    broadcastRoomUpdate(io, roomId);
  });
}
