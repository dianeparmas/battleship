import React from "react";

export interface Ship {
  x: number;
  y: number;
  width: number;
  height: number;
  currentlyActive?: boolean;
  size: number;
  isHorizontal: boolean;
  sections: [{ x: number; y: number; hit: boolean; cell: string }];
  isDestroyed: boolean;
  animationStartTime?: number | undefined;
}

export interface CoordinatePoints {
  x: number;
  y: number;
}

export interface CanvasProps {
  width?: number;
  height?: number;
  id: string;
  isGrid?: boolean;
  className?: string;
  gridCellSize?: number;
  isPlayground?: boolean;
  startingPoint?: number;
  isCoordinates?: boolean;
  isShipyard?: boolean;
  isShips?: boolean;
  shipp?: boolean;
  setShips?: () => void;
  isHighlight?: boolean;
  strikedSquares?: StrikeObj[];
}

export interface ImgObj {
  image: HTMLImageElement;
  highlightCell: React.MutableRefObject<Ship>;
  gridCellSize: number;
}

export interface StrikeObj {
  currentHighLightCell: { height: number; width: number; x: number; y: number };
  hit: boolean;
}

export interface GameStateStrikeObj {
  ships: Ship[];
  hits: string[];
  misses: string[];
}

export type ShipSize = 2 | 3 | 4 | 5;
