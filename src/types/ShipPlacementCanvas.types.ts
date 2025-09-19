import { Dispatch, SetStateAction } from "react";

import { Ship } from "./battleship.types";

export interface ShipPlacementCanvasProps {
  id: string;
  className?: string;
  setShips: Dispatch<SetStateAction<Ship[]>>;
  handleBeginGame: (playerShips: Ship[]) => void;
  isGameTime: boolean;
}
