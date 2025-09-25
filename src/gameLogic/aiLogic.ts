import { coordsToGridCell, gridCellToCoords } from "../utils/canvasUtils";

export const simpleAIMove = (triedCells: string[], boardSize = 10): string => {
  const tried = new Set(triedCells);
  let x, y, cell;
  do {
    x = Math.floor(Math.random() * boardSize);
    y = Math.floor(Math.random() * boardSize);
    cell = coordsToGridCell(x * 50, y * 50);
  } while (!cell || tried.has(cell));
  return cell;
};

// Helper for adjacent cells
export const getAdjacentCells = (cell: string, boardSize = 10): string[] => {
  const { x, y } = gridCellToCoords(cell);
  const col = x / 50;
  const row = y / 50;
  const adj = [
    [col - 1, row], // cell to the left
    [col + 1, row], // cell to the right
    [col, row - 1], // cell above
    [col, row + 1], // cell below
  ];
  //For example, if the current cell is in the top-left corner [0, 0], this filter will remove the coordinates for the "left" cell [-1, 0] and the "top" cell [0, -1] because they are less than 0. Similarly, it will remove any cells that are greater than or equal to the boardSize (e.g., a cell at position [10, 5] on a 10x10 grid). This ensures the function only returns valid adjacent cells.
  return adj
    .filter(
      ([nx, ny]) => nx >= 0 && ny >= 0 && nx < boardSize && ny < boardSize,
    ) // filter out coords that are off the board
    .map(([nx, ny]) => coordsToGridCell(nx * 50, ny * 50)) //maps/transforms the remaining valid col and row coords into iriginal string 'A1' etc,then multiplis by 50 to convert into pixel coords
    .filter(Boolean); //filter out falseys-null, undefined ,empty
};

export const getShipAdjacentCells = (
  cells: string[],
  boardSize = 10,
): string[] => {
  const adjacentCells: string[] = [];
  console.log("getShipAdjacentCells input: ", cells);

  // 1. Iterate through each cell and collect all adjacent cells
  for (const cell of cells) {
    const adj = getAdjacentCells(cell, boardSize);
    adjacentCells.push(...adj);
  }

  // 2. Filter out duplicates using a Set
  const uniqueAdjacentCells = new Set(adjacentCells);

  // 3. Filter out any cells that are part of the original rectangle
  const rectangleCells = new Set(cells);
  const finalAdjacentCells = [...uniqueAdjacentCells].filter(
    (cell) => !rectangleCells.has(cell),
  );

  return finalAdjacentCells;
};

export const normalAIMove = (
  playerHits: string[],
  playerMisses: string[],
  triedCells: string[],
  boardSize = 10,
): string => {
  const tried = new Set(triedCells);
  for (let i = playerHits.length - 1; i >= 0; i--) {
    const hit = playerHits[i];
    const adj = getAdjacentCells(hit, boardSize).filter(
      (cell) => !tried.has(cell),
    );
    if (adj.length > 0) {
      return adj[Math.floor(Math.random() * adj.length)];
    }
  }
  let x, y, cell;
  do {
    x = Math.floor(Math.random() * boardSize);
    y = Math.floor(Math.random() * boardSize);
    cell = coordsToGridCell(x * 50, y * 50);
  } while (!cell || tried.has(cell));
  return cell;
};

// Add new state to track hits for the current "target"
let recentHits: string[] = [];

export const realisticAIMove = (
  playerHits: string[],
  playerMisses: string[],
  triedCells: string[],
  destroyedShips: Ship[],
  boardSize = 10,
): string => {
  const tried = new Set(triedCells);
  recentHits = playerHits;

  // Check if the most recent hit belongs to a sunk ship.
  const lastHit = playerHits[playerHits.length - 1];
  const sunkShip = destroyedShips.find((ship) => ship.cells4.includes(lastHit));

  console.log(
    destroyedShips.map((ship) => {
      console.log(ship.cells4);
    }),
  );

  // If the last hit was on a sunk ship, reset the recentHits to "hunt" mode.
  if (sunkShip) {
    // You should also remove the sunk ship's cells from recentHits.
    recentHits = recentHits.filter((cell) => !sunkShip.cells4.includes(cell));
  }

  console.log(
    "%c realistic: sunkShip",
    "font-size: 15px; color: green;",
    sunkShip,
  );

  console.log("%c realistic: tried", "font-size: 15px; color: green;", tried);

  console.log(
    "%c realistic: recentHits, recentHits.length",
    "font-size: 15px; color: green;",
    recentHits,
    recentHits.length,
  );
  // New logic for directional targeting
  if (recentHits.length >= 2) {
    const lastHit = recentHits[recentHits.length - 1];
    const secondLastHit = recentHits[recentHits.length - 2];

    console.log(
      "%c realistic: lastHit",
      "font-size: 15px; color: green;",
      lastHit,
    );
    console.log(
      "%c realistic: secondLastHit",
      "font-size: 15px; color: green;",
      secondLastHit,
    );

    const { x: lastX, y: lastY } = gridCellToCoords(lastHit);
    const { x: secondLastX, y: secondLastY } = gridCellToCoords(secondLastHit);

    console.log(
      "%c realistic: lastX lastY",
      "font-size: 15px; color: green;",
      lastX,
      lastY,
    );
    console.log(
      "%c realistic: secondLastX secondLastY",
      "font-size: 15px; color: green;",
      secondLastX,
      secondLastY,
    );

    let adjCells: string[] = [];

    // Check if the hits are horizontal
    if (lastY === secondLastY) {
      console.log(
        "%c realistic: if horizontal hits ---------- lastY === secondLastY",
        "font-size: 15px; color: #3ad33a;",
      );
      const minX = Math.min(lastX, secondLastX);
      const maxX = Math.max(lastX, secondLastX);

      console.log(
        "%c realistic: ------------- minX",
        "font-size: 15px; color: #3ad33a;",
        minX,
      );
      console.log(
        "%c realistic: ------------ maxX",
        "font-size: 15px; color: #3ad33a;",
        maxX,
      );

      const potentialCells = [
        coordsToGridCell(minX - 50, lastY),
        coordsToGridCell(maxX + 50, lastY),
      ];

      console.log(
        "%c realistic: ------------ potentialCells",
        "font-size: 15px; color: #3ad33a;",
        potentialCells,
      );

      adjCells = potentialCells.filter((cell) => cell && !tried.has(cell));

      console.log(
        "%c realistic: ------------ adjCells",
        "font-size: 15px; color: #3ad33a;",
        adjCells,
      );
    }

    // Check if the hits are vertical
    else if (lastX === secondLastX) {
      console.log(
        "%c realistic: if vertical hits ---------- lastX === secondLastX",
        "font-size: 15px; color: #a874e7ff;",
      );
      const minY = Math.min(lastY, secondLastY);
      const maxY = Math.max(lastY, secondLastY);

      console.log(
        "%c realistic: ------------ minY",
        "font-size: 15px; color: #a874e7ff;",
        minY,
      );
      console.log(
        "%c realistic: ------------ maxY",
        "font-size: 15px; color: #a874e7ff;",
        maxY,
      );

      const potentialCells = [
        coordsToGridCell(lastX, minY - 50),
        coordsToGridCell(lastX, maxY + 50),
      ];

      console.log(
        "%c realistic: ------------ potentialCells",
        "font-size: 15px; color: #a874e7ff;",
        potentialCells,
      );

      adjCells = potentialCells.filter((cell) => cell && !tried.has(cell));

      console.log(
        "%c realistic: ------------ adjCells",
        "font-size: 15px; color: #a874e7ff;",
        adjCells,
      );
    }

    if (adjCells.length > 0) {
      return adjCells[Math.floor(Math.random() * adjCells.length)];
    }
  }

  // Fallback to targeting mode (if recentHits has a single hit).
  if (recentHits.length === 1) {
    const singleHit = recentHits[0];
    const adj = getAdjacentCells(singleHit, boardSize).filter(
      (cell) => !tried.has(cell),
    );
    if (adj.length > 0) {
      return adj[Math.floor(Math.random() * adj.length)];
    }
  }

  // Original logic for a single hit or random hunting
  for (let i = playerHits.length - 1; i >= 0; i--) {
    const hit = playerHits[i];
    const adj = getAdjacentCells(hit, boardSize).filter(
      (cell) => !tried.has(cell),
    );
    if (adj.length > 0) {
      return adj[Math.floor(Math.random() * adj.length)];
    }
  }

  // Original random move logic
  let x, y, cell;
  do {
    x = Math.floor(Math.random() * boardSize);
    y = Math.floor(Math.random() * boardSize);
    cell = coordsToGridCell(x * 50, y * 50);
  } while (!cell || tried.has(cell));
  return cell;
};
