import { GameStateStrikeObj, StrikeObj } from "./battleship.types";

export interface StrikesCanvasProps {
  width?: number;
  height?: number;
  id: string;
  isGrid?: boolean;
  className?: string;
  gridCellSize?: number;
  strikedSquares?: StrikeObj[] | GameStateStrikeObj;
  isPlayerStrikes?: boolean;
}

export interface PlayerStrikesProps extends StrikesCanvasProps {
  strikedSquares: StrikeObj[];
}

export interface GameStrikesProps extends StrikesCanvasProps {
  strikedSquares: GameStateStrikeObj;
}
