import { RefObject } from "react";

import { CoordinatePoints, ImageCache, StrikeObj } from "./battleship.types";

export interface FlameFlickerCanvasProps {
  className: string;
  opponentBoardHits?: StrikeObj[];
  imageCache: ImageCache;
  fireStrikes: RefObject<CoordinatePoints[]>;
  playerBoardHits?: string[];
}
