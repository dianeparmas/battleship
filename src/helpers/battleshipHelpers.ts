import {
  generateCellsParams,
  generateSectionsParams,
  Ship,
} from "../types/battleship.types";

import { GRID_CELL_SIZE } from "../constants/canvasConstants";

import { roundToNearest, coordsToGridCell } from "../utils/canvasUtils";

export const generateSections = (
  generateSectionsParams: generateSectionsParams,
) => {
  const { size, isHorizontalShip, xPosition, yPosition } =
    generateSectionsParams;
  const sections = [];

  for (let i = 0; i < size; i++) {
    let x, y;

    // Calculate the coordinates for this section
    if (isHorizontalShip) {
      x = roundToNearest(xPosition) + GRID_CELL_SIZE * i;
      y = roundToNearest(yPosition);
    } else {
      x = roundToNearest(xPosition);
      y = roundToNearest(yPosition) + GRID_CELL_SIZE * i;
    }
    const cell = coordsToGridCell(x, y);

    if (cell) {
      sections.push({
        cell: cell,
        hit: false,
      });
    } else {
      // Log an error if a ship section is placed out of bounds (shouldn't happen with correct placement logic)
      console.error("Ship section placed out of bounds. Skipping section.", {
        x,
        y,
      });
    }
  }
  return sections;
};

export const generateShipCells = (generateCellsParams: generateCellsParams) => {
  const { size, isHorizontalShip, xPosition, yPosition } = generateCellsParams;
  const cells = [];
  for (let i = 0; i < size; i++) {
    if (isHorizontalShip) {
      cells.push(
        coordsToGridCell(
          roundToNearest(xPosition) + GRID_CELL_SIZE * i,
          roundToNearest(yPosition),
        ),
      );
    } else {
      cells.push(
        coordsToGridCell(
          roundToNearest(xPosition),
          roundToNearest(yPosition) + GRID_CELL_SIZE * i,
        ),
      );
    }
  }
  return cells;
};

export const snapMovedShipToGrid = (arr: Ship[]) => {
  const newShipPositions = arr.map((ship) => {
    return {
      ...ship,
      x: roundToNearest(ship.x),
      y: roundToNearest(ship.y),
      sections: generateSections({
        size: ship.size,
        isHorizontalShip: ship.isHorizontal,
        xPosition: roundToNearest(ship.x),
        yPosition: roundToNearest(ship.y),
      }),
      cells: generateShipCells({
        size: ship.size,
        isHorizontalShip: ship.isHorizontal,
        xPosition: roundToNearest(ship.x),
        yPosition: roundToNearest(ship.y),
      }),
    };
  });
  return newShipPositions;
};
