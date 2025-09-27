import { GRID_CELL_SIZE } from "../constants/canvasConstants";

import { roundToNearest, coordsToGridCell } from "../utils/canvasUtils";

export const generateSections = (generateSectionsArg) => {
  const { size, isHorizontalShip, xPosition, yPosition, gridCellSize } =
    generateSectionsArg;

  // console.log('generateSectionsArg:', generateSectionsArg);
  //{size: 2, isHorizontalShip: true, xPosition: 250, yPosition: 51.390625, gridCellSize: 50} from PLAYER
  //{size: 3, isHorizontalShip: true, x: 150, y: 100, gridCellSize: 50} ai horizontal
  //{size: 3, isHorizontalShip: false, x: 300, y: 50, gridCellSize: 50} ai vertical
  const sections = [];
  // console.log(
  //   "size in GenerateSections",
  //   size,
  //   isHorizontalShip,
  //   generateSectionsArg,
  // );
  for (let i = 0; i < size; i++) {
    if (isHorizontalShip) {
      sections.push({
        // x: roundToNearest(xPosition) + gridCellSize * i,
        // y: roundToNearest(yPosition),
        cell: coordsToGridCell(
          roundToNearest(xPosition) + gridCellSize * i,
          roundToNearest(yPosition),
        ),
        hit: false,
      });
    } else {
      sections.push({
        // x: roundToNearest(xPosition),
        // y: roundToNearest(yPosition) + gridCellSize * i,
        cell: coordsToGridCell(
          roundToNearest(xPosition),
          roundToNearest(yPosition) + gridCellSize * i,
        ),
        hit: false,
      });
    }
  }
  return sections;
};

export const generateShipCells = (generateCellsParam) => {
  const { size, isHorizontalShip, xPosition, yPosition } = generateCellsParam;
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

// export const addGridCoord = (arr, isHorizontalShip) => {

//   const generateCoords = (x, y, size, isHorizontalShip) => {
//     let coord = [];
//     for (let i = 0; i < size; i++) {
//       const coordX = isHorizontalShip ? x + 50 * i : x;
//       const coordY = isHorizontalShip ? y : y + 50 * i;
//       coord.push(coordsToGridCell(coordX, coordY));
//     }
//     return coord;
//   };

//   const mapped = arr.map((ship) => {
//     return {
//       ...ship,
//       cells: generateCoords(
//         ship.x,
//         ship.y,
//         ship.size,
//         isHorizontalShip,
//       ),
//     };
//   });
//   return mapped;
// };

export const snapMovedShipToGrid = (arr) => {
  // console.log("snapShipsToGridAfterMove", arr);
  const newShipPositions = arr.map((ship) => {
    console.log(ship);
    return {
      ...ship,
      x: roundToNearest(ship.x),
      y: roundToNearest(ship.y),
    };
  });
  return newShipPositions;
};
