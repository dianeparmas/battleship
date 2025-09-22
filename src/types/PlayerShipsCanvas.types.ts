import { Ship } from "./battleship.types";
import { GameAction, GameState } from "./gameState.types";

export interface PlayerShipsCanvasProps {
  id: string;
  className?: string;
  playerShips: Ship[];
  dispatch: React.Dispatch<GameAction>;
    gameState: GameState;
}
