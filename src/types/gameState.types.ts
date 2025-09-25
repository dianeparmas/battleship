import { Ship } from "./battleship.types";

export type Difficulty = "easy" | "normal" | "realistic";

export type GameAction =
  | { type: "SET_AI_TURN"; move: string; isHit: boolean | undefined }
  | { type: "SET_AI_MOVE"; move: string }
  | { type: "SET_PLAYER_DESTROYED_SHIPS"; destroyedShip: Ship }
  | { type: "SET_AI_DESTROYED_SHIPS"; destroyedShip: Ship }
  | { type: "AI_TURN"; result: "hit" | "miss"; cell: string }
  | { type: "PLAYER_TURN"; result: "hit" | "miss"; cell: string }
  | { type: "PLAYER_HIT"; cell: string }
  | { type: "PLAYER_MISS"; cell: string }
  | { type: "CHANGE_DIFFICULTY"; difficulty: Difficulty }
  | { type: "BEGIN_GAME"; ships: Ship[]; status: "playing" }
  | { type: "SET_AI_SHIPS"; ships: Ship[] };

export type GameState = {
  player: {
    ships: Ship[];
    hits: string[];
    misses: string[];
    destroyedShips: Ship[];
  };
  ai: {
    ships: Ship[];
    hits: string[];
    misses: string[];
    destroyedShips: Ship[];
    latestMove: string;
  };
  currentTurn: "player" | "ai";
  status: "setup" | "playing" | "playerWon" | "aiWon";
  difficulty: Difficulty;
};
