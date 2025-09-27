import { Ship } from "./battleship.types";

export interface dragShipParams {
  event: React.MouseEvent<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;
  shipPositions: Ship[];
  currentlyActiveShip: {
    current: Ship
  };
  canvasRef: HTMLCanvasElement;
  mouseOffsetRef: {
    current: {
      x: number;
      y: number;
    };
  }; 
  movedShips: {
    current: {
      x: number;
      y: number;
    };
  };
  movedShipRef: {
    current: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}
