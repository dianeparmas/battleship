import { Ship } from "./battleship.types";

export interface SunkenShipsCanvasProps {
  id: string;
  className?: string;
  sunkenShips: Ship[];
}
