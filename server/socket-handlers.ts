import { Server, Socket } from "socket.io";
import { registerRoomHandlers } from "./handlers/room-handler";
import { registerGameHandlers } from "./handlers/game-handler";
import { registerDrawHandlers } from "./handlers/draw-handler";
import { registerChatHandlers } from "./handlers/chat-handler";

export function registerSocketHandlers(io: Server, socket: Socket) {
  // Delegate socket events to modular category handlers
  registerRoomHandlers(io, socket);
  registerGameHandlers(io, socket);
  registerDrawHandlers(io, socket);
  registerChatHandlers(io, socket);
}
