import { ImageCache } from "./battleship.types";
import { GameAction, GameState } from "./gameState.types";

export interface OpponentCanvasProps {
  id: string;
  className?: string;
  startingPoint?: number;
  dispatch: React.Dispatch<GameAction>;
  gameState: GameState;
  imageCache: ImageCache;
}

export interface HighlightCell {
  x: number;
  y: number;
  width: number;
  height: number;
  currentlyActive?: boolean | undefined;
}
