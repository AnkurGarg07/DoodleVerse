export interface Player {
  id: string;
  username: string;
  avatar: string; // URL or emoji/descriptor
  score: number;
  isHost: boolean;
  isDrawing: boolean;
  guessCorrect: boolean;
  isAI?: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: string;
  isSystem: boolean;
  isCorrectGuess: boolean;
}

export interface GameSettings {
  rounds: number;
  drawTime: number; // in seconds
  wordPack: string; // "General" | "Animals" | "Food" | "Objects"
}

export type RoomState = "LOBBY" | "DRAW_CHOICE" | "DRAWING" | "REVEAL" | "END";

export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  points: Point[];
  color: string;
  width: number;
}

export interface GameRoom {
  roomCode: string;
  players: Player[];
  messages: ChatMessage[];
  settings: GameSettings;
  currentRound: number;
  currentRoundState: RoomState;
  currentDrawerId: string | null;
  currentWord: string | null;
  hint: string;
  timer: number;
  canvasPaths: DrawingPath[];
  wordChoices: string[];
  winnerId: string | null;
  lastActive: number; // timestamp for room cleanup
}
