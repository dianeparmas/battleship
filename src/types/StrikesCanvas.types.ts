import { GameStateStrikeObj, StrikeObj } from "./battleship.types";

export interface StrikesCanvasProps {
  width?: number;
  height?: number;
  id: string;
  isGrid?: boolean;
  className?: string;
  gridCellSize?: number;
  isPlayerStrikes?: boolean;
  opponentBoardStrikes: StrikeObj[],
  playerBoardStrikes: GameStateStrikeObj,
}
