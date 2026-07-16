import { Server, Socket } from "socket.io";
import { Player } from "../types";
import {
  rooms,
  clearRoomTimer,
  broadcastRoomUpdate,
  startDrawerWordChoicePhase,
} from "../state";

export function registerRoomHandlers(io: Server, socket: Socket) {
  
  // Create Room Event Handler
  socket.on(
    "create-room",
    ({
      username,
      avatar,
      settings,
    }: {
      username: string;
      avatar: string;
      settings: { rounds: number; drawTime: number; wordPack: string };
    }) => {
      const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();

      rooms[roomId] = {
        roomCode: roomId,
        players: [
          {
            id: socket.id,
            username: username.trim() || "Guest Doodler",
            avatar: avatar || "🦊",
            score: 0,
            isHost: true,
            isDrawing: false,
            guessCorrect: false,
          },
        ],
        messages: [],
        settings: settings || {
          rounds: 3,
          drawTime: 80,
          wordPack: "General",
        },
        currentRound: 1,
        currentRoundState: "LOBBY",
        currentDrawerId: null,
        currentWord: null,
        hint: "",
        timer: 80,
        canvasPaths: [],
        wordChoices: [],
        winnerId: null,
        lastActive: Date.now(),
      };

      console.log("Room Created on Server:", roomId);
      socket.emit("room-created", roomId);
    }
  );

  // Join Room Event Handler
  socket.on(
    "join-room",
    ({
      roomId,
      username,
      avatar,
    }: {
      roomId: string;
      username: string;
      avatar: string;
    }) => {
      const room = rooms[roomId];
      if (!room) {
        socket.emit("error", "Room not found!");
        return;
      }

      const exists = room.players.find((p) => p.id === socket.id);
      if (!exists) {
        const isHost = room.players.length === 0;
        const newPlayer: Player = {
          id: socket.id,
          username: username.trim() || `Player ${room.players.length + 1}`,
          avatar: avatar || "🦊",
          score: 0,
          isHost,
          isDrawing: false,
          guessCorrect: false,
        };

        room.players.push(newPlayer);
      }

      socket.join(roomId);
      console.log(`Socket ${socket.id} (${username}) joined room ${roomId}`);

      room.messages.push({
        id: Math.random().toString(),
        playerId: "system",
        playerName: "System",
        text: `${username} joined the lobby! 🎉`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isSystem: true,
        isCorrectGuess: false,
      });

      broadcastRoomUpdate(io, roomId);
    }
  );

  // Leave Room Event Handler
  socket.on("leave-room", ({ roomId }: { roomId: string }) => {
    handlePlayerExit(roomId);
  });

  // Helper exit coordinator
  const handlePlayerExit = (roomId: string) => {
    const room = rooms[roomId];
    if (!room) return;

    room.players = room.players.filter((p) => p.id !== socket.id);
    console.log(`Socket ${socket.id} left room ${roomId}`);

    socket.leave(roomId);

    if (room.players.length === 0) {
      clearRoomTimer(roomId);
      console.log(`Room ${roomId} is empty. Scheduling deletion in 60s grace period...`);
      // 60 seconds grace period to allow Next.js compiler reloads
      setTimeout(() => {
        const currentRoom = rooms[roomId];
        if (currentRoom && currentRoom.players.length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} was empty for 60s. Deleted.`);
        } else {
          console.log(`Room ${roomId} deletion cancelled because players rejoined.`);
        }
      }, 60000);
    } else {
      const hasHost = room.players.some((p) => p.isHost);
      if (!hasHost && room.players.length > 0) {
        room.players[0].isHost = true;
      }

      if (room.currentDrawerId === socket.id && room.currentRoundState !== "LOBBY") {
        room.messages.push({
          id: Math.random().toString(),
          playerId: "system",
          playerName: "System",
          text: `Active drawer disconnected. Skipping turn...`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isSystem: true,
          isCorrectGuess: false,
        });
        startDrawerWordChoicePhase(io, roomId);
      } else {
        broadcastRoomUpdate(io, roomId);
      }
    }
  };

  // Disconnect Cleanup Event Handler
  socket.on("disconnect", () => {
    console.log("Disconnected socket:", socket.id);
    Object.keys(rooms).forEach((roomId) => {
      const inRoom = rooms[roomId].players.some((p) => p.id === socket.id);
      if (inRoom) {
        handlePlayerExit(roomId);
      }
    });
  });
}
