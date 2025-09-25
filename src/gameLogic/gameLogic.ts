import { GRID_CELL_SIZE, SHIP_SIZES } from "../constants/canvasConstants";

import { gridCellToCoords, coordsToGridCell } from "../utils/canvasUtils";

export const checkStrike = (aiMove, gameState) => {
  console.log("checkStrike in gameLogic file");
  const playerShips = gameState.player.ships;
  if (playerShips.length) {
    let isHit = false;
    let returnValue;

    for (const ship of playerShips) {
      isHit = ship.sections.some((rect) => {
        if (rect.cell === aiMove) {
          rect.hit = true;
          return true;
        }
      });

      if (isHit) {
        break;
      }
    }

    if (isHit) {
      console.log("ai Hit!");
      returnValue = true;
    } else {
      console.log("ai Miss!");
      returnValue = false;
    }
    return returnValue;
  }
};

console.log("generatetest");

export const placeAiShips = (ctx: CanvasRenderingContext2D, boardSize = 10) => {
  const MAX_ATTEMPTS_PER_SHIP = 1000;
  const MAX_BOARD_RETRIES = 50;

  let boardRetries = 0;

  const generatedShips = [];
  while (boardRetries < MAX_BOARD_RETRIES) {
    const placedCells = [];
    const shipsToDraw = [];
    let failed = false;

    for (const shipLength of SHIP_SIZES) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < MAX_ATTEMPTS_PER_SHIP) {
        attempts++;

        // 50-50 chance for horizontal or vertical
        const isVertical = Math.random() >= 0.5;

        let maxStartColumn, maxStartRow;
        if (isVertical) {
          maxStartColumn = boardSize - 1;
          maxStartRow = boardSize - shipLength;
        } else {
          // horizontal
          maxStartColumn = boardSize - shipLength;
          maxStartRow = boardSize - 1;
        }

        const col = Math.floor(Math.random() * (maxStartColumn + 1));
        const row = Math.floor(Math.random() * (maxStartRow + 1));

        const startX = col * GRID_CELL_SIZE;
        const startY = row * GRID_CELL_SIZE;

        let newShipCells;
        if (isVertical) {
          newShipCells = Array.from({ length: shipLength }, (_, i) =>
            coordsToGridCell(startX, startY + i * GRID_CELL_SIZE),
          );
        } else {
          // horizontal
          newShipCells = Array.from({ length: shipLength }, (_, i) =>
            coordsToGridCell(startX + i * GRID_CELL_SIZE, startY),
          );
        }

        if (newShipCells.length !== shipLength) continue;

        const overlaps = newShipCells.some((c) => placedCells.includes(c));
        if (overlaps) continue;

        placedCells.push(...newShipCells);

        const firstCell = gridCellToCoords(newShipCells[0]);
        const width = isVertical ? GRID_CELL_SIZE : shipLength * GRID_CELL_SIZE;
        const height = isVertical
          ? shipLength * GRID_CELL_SIZE
          : GRID_CELL_SIZE;

        shipsToDraw.push({
          x: firstCell.x,
          y: firstCell.y,
          width,
          height,
          isHorizontal: !isVertical,
        });
        placed = true;
      }

      if (!placed) {
        failed = true;
        break;
      }
    }

    if (!failed) {
      for (const ship of shipsToDraw) {
        ctx.strokeStyle =
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0");
        ctx.lineWidth = 5;
        ctx.strokeRect(ship.x, ship.y, ship.width, ship.height);
      }
      generatedShips.push(shipsToDraw);
      // return both placedCells and shipsToDraw
      return { placedCells, shipsToDraw };
      // return placedCells;
    }

    boardRetries++;
  }
  throw new Error("Failed to place all ships after many retries");
};

export const getRectangleCells = (
  startCell: string,
  length: number,
  boardSize = 10,
): string[] => {
  console.log("getRectangleCells ", startCell);
  const { x, y } = gridCellToCoords(startCell); // pixel coords
  const startCol = x / 50;
  const startRow = y / 50;

  const cells: string[] = [];

  for (let i = 0; i < length; i++) {
    const col = startCol + i;
    // const row = startRow + i;
    const row = startRow;

    // stop if outside board
    if (col >= boardSize || row >= boardSize) break;

    cells.push(coordsToGridCell(col * 50, row * 50)); // output A1 B2 etc
  }

  return cells.filter(Boolean);
};
