import { Ship } from "./battleship.types";
import { GameAction } from "./gameState.types";

export interface ShipPlacementCanvasProps {
  id: string;
  className?: string;
  handleBeginGame: (playerShips: Ship[]) => void;
  isGameTime: boolean;
  dispatch: React.Dispatch<GameAction>;
}
