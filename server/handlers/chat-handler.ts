import { Server, Socket } from "socket.io";
import { rooms, broadcastRoomUpdate } from "../state";

export function registerChatHandlers(io: Server, socket: Socket) {
  
  // Send Message / Guess Validation Event Handler
  socket.on(
    "send-message",
    ({ roomId, text }: { roomId: string; text: string }) => {
      const room = rooms[roomId];
      if (!room) return;

      const player = room.players.find((p) => p.id === socket.id);
      if (!player) return;

      const isCurrentDrawer = socket.id === room.currentDrawerId;
      const isCorrectWord =
        room.currentRoundState === "DRAWING" &&
        room.currentWord &&
        text.toLowerCase().trim() === room.currentWord.toLowerCase().trim();

      const timeString = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Validate correctness
      if (isCorrectWord && !isCurrentDrawer && !player.guessCorrect) {
        player.guessCorrect = true;
        const earned = 100 + Math.round(room.timer * 0.75);
        player.score += earned;

        room.messages.push({
          id: Math.random().toString(),
          playerId: "system",
          playerName: "System",
          text: `${player.username} guessed the word correctly! 🎉 (+${earned} pts)`,
          timestamp: timeString,
          isSystem: true,
          isCorrectGuess: true,
        });

        console.log(`Room ${roomId}: ${player.username} guessed correctly!`);
      } else {
        // Append normal text message
        room.messages.push({
          id: Math.random().toString(),
          playerId: socket.id,
          playerName: player.username,
          text: text,
          timestamp: timeString,
          isSystem: false,
          isCorrectGuess: false,
        });
      }

      broadcastRoomUpdate(io, roomId);
    }
  );
}
