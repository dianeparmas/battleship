import { GameAction, GameState } from "../types/gameState.types";

export const initialGameState: GameState = {
  player: { ships: [], hits: [], misses: [], destroyedShips: [] },
  ai: { ships: [], hits: [], misses: [], destroyedShips: [], latestMove: "" },
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
        currentTurn: action.isHit ? "ai" : "player",
        ai: {
          ...state.ai,
          hits: action.isHit ? [...state.ai.hits, action.move] : state.ai.hits,
          misses: action.isHit
            ? state.ai.misses
            : [...state.ai.misses, action.move],
        },
      };

    case "SET_AI_MOVE":
      return {
        ...state,
        ai: {
          ...state.ai,
          latestMove: action.move,
        },
      };

    case "SET_PLAYER_DESTROYED_SHIPS":
      return {
        ...state,
        player: {
          ...state.player,
          destroyedShips: [...state.player.destroyedShips, action.destroyedShip],
        },
      };

    case "SET_AI_DESTROYED_SHIPS":
      console.log("%c SET_AI_DESTROYED_SHIPS", "color: purple;", {
        ...state,
        ai: {
          ...state.ai,
          destroyedShips: [...state.ai.destroyedShips, action.destroyedShip],
        },
      });
      return {
        ...state,
        ai: {
          ...state.ai,
          destroyedShips: [...state.ai.destroyedShips, action.destroyedShip],
        },
      };

    case "AI_TURN":
      console.log("%c AI_TURN", "color: purple;", action.result);
      return {
        ...state,
        player: {
          ...state.player,
          ships: state.player.ships.map((ship) => {
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
        currentTurn: action.result === "hit" ? "ai" : "player",
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
      // console.log("%c BEGIN_GAME", "color: purple;", {
      //   ...state,
      //   player: {
      //     ...state.player,
      //     ships: action.ships,
      //   },
      //   status: action.status,
      // });
      return {
        ...state,
        player: {
          ...state.player,
          ships: action.ships,
        },
        status: action.status,
      };

    case "CHANGE_DIFFICULTY":
      // console.log("%c CHANGE_DIFFICULTY", "color: purple;", {
      //   ...state,
      //   difficulty: action.difficulty,
      // });
      return {
        ...state,
        difficulty: action.difficulty,
      };

    case "SET_AI_SHIPS":
      // console.log("%c SET_AI_SHIPS", "color: purple;", {
      //   ...state,
      //   ai: { ...state.ai, ships: action.ships },
      // });
      return {
        ...state,
        ai: { ...state.ai, ships: action.ships },
      };

    default:
      return state;
  }
};
