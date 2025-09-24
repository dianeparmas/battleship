import { Ship } from "./battleship.types";

export interface ShipPlacementCanvasProps {
  id: string;
  className?: string;
  handleBeginGame: (playerShips: Ship[]) => void;
  isGameTime: boolean;
}
