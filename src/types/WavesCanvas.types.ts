import { Ship } from "./battleship.types";

export interface WavesCanvasProps {
  width?: number;
  height?: number;
  id: string;
  className?: string;
  isPlayerStrikes?: boolean;
  ships: Ship[];
}
