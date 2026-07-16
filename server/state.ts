import { Server } from "socket.io";
import { GameRoom } from "./types";

// In-memory store for game rooms and timer intervals
export const rooms: Record<string, GameRoom> = {};
export const roomTimers: Record<string, NodeJS.Timeout> = {};

export const WORD_PACKS: Record<string, string[]> = {
  General: [
    "Apple",
    "Banana",
    "Computer",
    "Guitar",
    "House",
    "Car",
    "Sun",
    "Tree",
    "Book",
    "Chair",
    "Bottle",
    "Phone",
    "Key",
    "Clock",
    "Bicycle",
    "Pencil",
    "Cloud",
    "Star",
  ],
  Animals: [
    "Lion",
    "Tiger",
    "Elephant",
    "Monkey",
    "Giraffe",
    "Zebra",
    "Cat",
    "Dog",
    "Bird",
    "Fish",
    "Fox",
    "Bear",
    "Rabbit",
    "Frog",
    "Shark",
    "Duck",
    "Cow",
  ],
  Food: [
    "Pizza",
    "Burger",
    "Sushi",
    "Pasta",
    "Cake",
    "Ice Cream",
    "Salad",
    "Taco",
    "Bread",
    "Cheese",
    "Cookie",
    "Donut",
    "Soup",
    "Grape",
    "Orange",
  ],
  Objects: [
    "Hammer",
    "Spoon",
    "Fork",
    "Knife",
    "Lock",
    "Mirror",
    "Scissors",
    "Ladder",
    "Umbrella",
    "Bucket",
    "Lamp",
    "Compass",
    "Key",
    "Clock",
    "Hammer",
  ],
};

// Clear active timer for a room
export function clearRoomTimer(roomId: string) {
  if (roomTimers[roomId]) {
    clearInterval(roomTimers[roomId]);
    delete roomTimers[roomId];
  }
}

// Broadcast room state updates to all clients in room
export function broadcastRoomUpdate(io: Server, roomId: string) {
  const room = rooms[roomId];
  if (room) {
    io.to(roomId).emit("room-updated", room);
  }
}

// Pick 3 random unique words
export function getWordChoices(packName: string): string[] {
  const list = WORD_PACKS[packName] || WORD_PACKS["General"];
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

// Mask word into underscores
export function generateHint(word: string): string {
  return word
    .split("")
    .map((char) => (char === " " ? " " : "_"))
    .join(" ");
}

// Phase 1: Start Drawer Selection & Word Choice countdown
export function startDrawerWordChoicePhase(io: Server, roomId: string) {
  const room = rooms[roomId];
  if (!room) return;

  clearRoomTimer(roomId);

  // Find next player who has not drawn yet this round
  let nextDrawer = room.players.find((p) => !p.isDrawing);

  // If everyone drawn, increment round or end the game
  if (!nextDrawer) {
    if (room.currentRound >= room.settings.rounds) {
      // Game ended
      room.currentRoundState = "END";
      const winner = [...room.players].sort((a, b) => b.score - a.score)[0];
      room.winnerId = winner ? winner.id : null;
      room.currentDrawerId = null;
      room.currentWord = null;
      room.hint = "";
      broadcastRoomUpdate(io, roomId);
      return;
    } else {
      room.currentRound += 1;
      room.players.forEach((p) => (p.isDrawing = false));
      nextDrawer = room.players[0];
    }
  }

  room.currentRoundState = "DRAW_CHOICE";
  room.currentDrawerId = nextDrawer.id;
  nextDrawer.isDrawing = true;
  room.players.forEach((p) => (p.guessCorrect = false));

  room.canvasPaths = [];
  room.wordChoices = getWordChoices(room.settings.wordPack);
  room.timer = 15;

  broadcastRoomUpdate(io, roomId);

  roomTimers[roomId] = setInterval(() => {
    room.timer -= 1;
    if (room.timer <= 0) {
      const autoWord = room.wordChoices[0] || "Apple";
      startDrawingPhase(io, roomId, autoWord);
    } else {
      broadcastRoomUpdate(io, roomId);
    }
  }, 1000);
}

// Phase 2: Start Drawing/Sketching timer countdown
export function startDrawingPhase(io: Server, roomId: string, word: string) {
  const room = rooms[roomId];
  if (!room) return;

  clearRoomTimer(roomId);

  room.currentRoundState = "DRAWING";
  room.currentWord = word;
  room.hint = generateHint(word);
  room.timer = room.settings.drawTime;

  broadcastRoomUpdate(io, roomId);

  roomTimers[roomId] = setInterval(() => {
    room.timer -= 1;

    const guessers = room.players.filter((p) => p.id !== room.currentDrawerId);
    const allCorrect = guessers.length > 0 && guessers.every((g) => g.guessCorrect);

    if (room.timer <= 0 || allCorrect) {
      startRevealPhase(io, roomId);
    } else {
      broadcastRoomUpdate(io, roomId);
    }
  }, 1000);
}

// Phase 3: Reveal word for all players
export function startRevealPhase(io: Server, roomId: string) {
  const room = rooms[roomId];
  if (!room) return;

  clearRoomTimer(roomId);

  room.currentRoundState = "REVEAL";
  room.timer = 6;

  broadcastRoomUpdate(io, roomId);

  roomTimers[roomId] = setInterval(() => {
    room.timer -= 1;
    if (room.timer <= 0) {
      startDrawerWordChoicePhase(io, roomId);
    } else {
      broadcastRoomUpdate(io, roomId);
    }
  }, 1000);
}
