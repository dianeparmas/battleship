import { Ship } from "./battleship.types";

export interface PlayerShipsCanvasProps {
  id: string;
  className?: string;
  playerShips: Ship[];
}

export type ShipSize = 2 | 3 | 4 | 5;
