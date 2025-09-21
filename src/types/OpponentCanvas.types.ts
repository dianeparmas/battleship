import { GameAction, GameState } from "./gameState.types";

export interface OpponentCanvasProps {
  id: string;
  className?: string;
  startingPoint?: number;
  dispatch: React.Dispatch<GameAction>;
  gameState: GameState;
}
