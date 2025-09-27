import { Ship } from "./battleship.types";

export interface WavesCanvasProps {
  id: string;
  className?: string;
  isPlayerStrikes?: boolean;
  ships: Ship[];
}

type Wave = {
  height: number;
  length: number;
  phase: number;
};

export type ShipWithWave = Ship & {
  wave: Wave;
};
