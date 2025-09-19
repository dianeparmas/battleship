import { Ship } from "./battleship.types";

export interface PlayerShipsCanvasProps {
  id: string;
  className?: string;
  playerShips: Ship[];
}
