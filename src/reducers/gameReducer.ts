import { Ship } from "../types/battleship.types";

type GameState = {
  player: {
    ships: Ship[];
    hits: string[]; // e.g., ["3,4"]
    misses: string[];
  };
  ai: {
    ships: Ship[];
    hits: string[];
    misses: string[];
  };
  currentTurn: "player" | "ai";
  status: "setup" | "playing" | "playerWon" | "aiWon";
  difficulty: "easy" | "normal";
};
type Difficulty = "easy" | "normal";
type GameAction =
  | { type: "SET_AI_TURN"; move: string; isHit: boolean | undefined }
  | { type: "PLAYER_TURN"; result: "hit" | "miss"; cell: string }
  | { type: "PLAYER_HIT"; cell: string }
  | { type: "PLAYER_MISS"; cell: string }
  | { type: "CHANGE_DIFFICULTY"; difficulty: Difficulty }
  | { type: "BEGIN_GAME"; ships: Ship[]; status: "playing" }
  | { type: "SET_AI_SHIPS"; ships: Ship[] };

export const initialGameState: GameState = {
  player: { ships: [], hits: [], misses: [] },
  ai: { ships: [], hits: [], misses: [] },
  currentTurn: "player",
  status: "setup",
  difficulty: "easy",
};

export const gameReducer = (
  state: GameState,
  action: GameAction,
): GameState => {
  switch (action.type) {
    case "SET_AI_TURN":
      return {
        ...state,
        currentTurn: "player", // ✅ switch back to player after AI turn
        ai: {
          ...state.ai,
          hits: action.isHit ? [...state.ai.hits, action.move] : state.ai.hits,
          misses: action.isHit
            ? state.ai.misses
            : [...state.ai.misses, action.move],
        },
      };

    case "PLAYER_TURN":
      return {
        ...state,
        player: {
          ...state.player,
          hits:
            action.result === "hit"
              ? [...state.player.hits, action.cell]
              : state.player.hits,
          misses:
            action.result === "miss"
              ? [...state.player.misses, action.cell]
              : state.player.misses,
        },
        ai: {
          ...state.ai,
          ships: state.ai.ships.map((ship) => {
            const updatedSections = ship.sections.map((section) =>
              action.result === "hit" && section.cell === action.cell
                ? { ...section, hit: true }
                : section,
            );

            const allSectionsHit = updatedSections.every(
              (section) => section.hit,
            );

            return {
              ...ship,
              sections: updatedSections,
              isDestroyed: allSectionsHit,
            };
          }),
        },
        currentTurn: action.result === "hit" ? "player" : "ai",
      };

    case "PLAYER_HIT":
      return {
        ...state,
        player: {
          ...state.player,
          hits: [...state.player.hits, action.cell],
        },
      };

    case "PLAYER_MISS":
      return {
        ...state,
        player: {
          ...state.player,
          misses: [...state.player.misses, action.cell],
        },
      };

    case "BEGIN_GAME":
      console.log("BEGIN_GAME", {
        ...state,
        player: {
          ...state.player,
          ships: action.ships,
        },
        status: action.status,
      });
      return {
        ...state,
        player: {
          ...state.player,
          ships: action.ships,
        },
        status: action.status,
      };

    case "CHANGE_DIFFICULTY":
      console.log("CHANGE_DIFFICULTY", {
        ...state,
        difficulty: action.difficulty,
      });
      return {
        ...state,
        difficulty: action.difficulty,
      };

    case "SET_AI_SHIPS":
      console.log("SET_AI_SHIPS", {
        ...state,
        ai: { ...state.ai, ships: action.ships },
      });
      return {
        ...state,
        ai: { ...state.ai, ships: action.ships },
      };

    default:
      return state;
  }
};
