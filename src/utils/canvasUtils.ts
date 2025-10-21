import React from "react";

import { Ship } from "../types/battleship.types";

import { GRID_CELL_SIZE } from "../constants/canvasConstants";

import { drawFloatingShips } from "../animations/animations";

import { drawRectangle } from "../drawing/drawing";

export const getMouseCoordinates = (
  event: React.MouseEvent<HTMLCanvasElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
) => {
  const rect = canvasRef?.current?.getBoundingClientRect();
  const x = event.clientX - (rect?.left || 0);
  const y = event.clientY - (rect?.top || 0);

  return { x, y };
};

export const getMouseOffsetCoordinates = (
  event: React.MouseEvent<HTMLCanvasElement>,
  shipPositions: Ship[] = [],
  canvasRef: React.RefObject<HTMLCanvasElement>,
  currentlyActiveShip: React.MutableRefObject<Ship>,
) => {
  const { x, y } = getMouseCoordinates(event, canvasRef);
  const targetShip = shipPositions.find(
    (ship) =>
      ship.x === currentlyActiveShip.current.x &&
      ship.y === currentlyActiveShip.current.y,
  ) ?? { x: 0, y: 0 };

  return {
    mouseOffsetX: x - targetShip.x,
    mouseOffsetY: y - targetShip.y,
  };
};

export const roundToNearest = (num: number) =>
  Math.round(num / GRID_CELL_SIZE) * GRID_CELL_SIZE;

export const clearAndRedrawAll = (
  ctx: CanvasRenderingContext2D,
  shipsArray: Ship[],
  imageCache,
) => {
  ctx.clearRect(0, 0, 500, 500);
  shipsArray.forEach((rect) => {
    // drawRectangle(ctx, rect);
    const floatingShipsParams = {
      ctx,
      ship: rect,
      imageCache,
      isStatic: true,
    };
    drawFloatingShips(floatingShipsParams);
  });
};

export const coordsToGridCell = (x: number, y: number) => {
  const GRID_SIZE = 10;
  // Calculate the zero-based row and column index
  const colIndex = Math.floor(x / GRID_CELL_SIZE);
  const rowIndex = Math.floor(y / GRID_CELL_SIZE);

  // Check if the calculated indices are within the grid bounds (0-9 for a 10x10 grid)
  if (
    colIndex < 0 ||
    colIndex >= GRID_SIZE ||
    rowIndex < 0 ||
    rowIndex >= GRID_SIZE
  ) {
    return null; // Coordinates are outside the grid
  }
  // Convert the column index to a letter
  const letter = String.fromCharCode("A".charCodeAt(0) + colIndex);
  // Convert the row index to a 1-based number
  const number = rowIndex + 1;

  // Combine the letter and number to form the Battleship coordinate string
  return `${letter}${number}`;
};

export const gridCellToCoords = (cell: string) => {
  const GRID_SIZE = 10;
  const letter = cell[0].toUpperCase(); // "B"
  const number = parseInt(cell.slice(1), 10); // 5

  // Convert letter back to column index
  const colIndex = letter.charCodeAt(0) - "A".charCodeAt(0);
  // Convert number back to row index (zero-based)
  const rowIndex = number - 1;

  // Validate bounds
  if (
    colIndex < 0 ||
    colIndex >= GRID_SIZE ||
    rowIndex < 0 ||
    rowIndex >= GRID_SIZE
  ) {
    return null; // Cell outside the grid
  }

  // Compute top-left pixel coords of that cell
  const x = colIndex * GRID_CELL_SIZE;
  const y = rowIndex * GRID_CELL_SIZE;

  return { x, y };
};
