import { Server, Socket } from "socket.io";
import {
  rooms,
  broadcastRoomUpdate,
  startDrawerWordChoicePhase,
  startDrawingPhase,
} from "../state";

export function registerGameHandlers(io: Server, socket: Socket) {
  
  // Update Settings Event Handler
  socket.on(
    "update-settings",
    ({
      roomId,
      settings,
    }: {
      roomId: string;
      settings: { rounds: number; drawTime: number; wordPack: string };
    }) => {
      const room = rooms[roomId];
      if (!room) return;

      room.settings = settings;
      console.log(`Room ${roomId} settings updated:`, settings);
      broadcastRoomUpdate(io, roomId);
    }
  );

  // Start Game Event Handler
  socket.on("start-game", ({ roomId }: { roomId: string }) => {
    const room = rooms[roomId];
    if (!room || room.players.length === 0) return;

    room.currentRound = 1;
    room.winnerId = null;
    room.messages = [];
    room.players.forEach((p) => {
      p.score = 0;
      p.guessCorrect = false;
      p.isDrawing = false;
    });

    startDrawerWordChoicePhase(io, roomId);
  });

  // Choose Word Event Handler
  socket.on(
    "choose-word",
    ({ roomId, word }: { roomId: string; word: string }) => {
      startDrawingPhase(io, roomId, word);
    }
  );
}
