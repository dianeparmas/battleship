import React, { useEffect, useRef, useState } from "react";

import { useTheme } from "../../../contexts/ThemeContext";

import {
  generateShipCells,
  generateSections,
  snapMovedShipToGrid,
} from "../../../helpers/battleshipHelpers";
import { dragShip } from "../../../helpers/dragShip";

import {
  CANVAS_SIZE,
  GRID_CELL_SIZE,
  SHIP_SIZES,
} from "../../../constants/canvasConstants";

import {
  clearAndRedrawAll,
  getMouseCoordinates,
  getMouseOffsetCoordinates,
  roundToNearest,
} from "../../../utils/canvasUtils";

import { drawRectangle } from "../../../drawing/drawing";

import {
  CoordinatePoints,
  HighlightCell,
  Ship,
  MovedShip,
} from "../../../types/battleship.types";

import { ShipPlacementCanvasProps } from "../../../types/ShipPlacementCanvas.types";

import styles from "./ShipPlacementCanvas.module.css";

const INITIAL_COORDS: CoordinatePoints = { x: 0, y: 0 };
const INITIAL_SHIP_PROPS: MovedShip = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  size: 0,
  isHorizontal: true,
};
const INITIAL_HIGHLIGHT_CELL = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  currentlyActive: false,
};
const INITIAL_ACTIVE_SHIP = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  currentlyActive: false,
  size: 0,
  isHorizontal: true,
};

const ShipPlacementCanvas = ({
  id,
  className = "",
  isGameTime,
  handleBeginGame,
  dispatch,
}: ShipPlacementCanvasProps) => {
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      console.log("Loop is starting for the first time.");
    }
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const movedShips = useRef<Ship[]>([]);
  const mouseOffsetRef = useRef<CoordinatePoints>(INITIAL_COORDS);
  const movedShipRef = useRef(INITIAL_SHIP_PROPS);
  const mousePathRef = useRef<CoordinatePoints[]>([INITIAL_COORDS]);
  const currentlyActiveShip = useRef(INITIAL_ACTIVE_SHIP);
  const highlightCell = useRef(INITIAL_HIGHLIGHT_CELL);
  const lastValidRef = useRef<CoordinatePoints | null>(INITIAL_COORDS);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCursorOverShip, setIsCursorOverShip] = useState(false);
  const [latestStartPoint, setLatestStartPoint] =
    useState<CoordinatePoints>(INITIAL_COORDS);
  const [latestEndPoint, setLatestEndPoint] =
    useState<CoordinatePoints>(INITIAL_COORDS);
  const [shipPositions, setShipPositions] = useState<Ship[]>([]);
  const [availableShipSizes, setAvailableShipSizes] =
    useState<typeof SHIP_SIZES>(SHIP_SIZES);

  const { canvasSize, cellSize } = useTheme();

  const shipsDiv = document.getElementById("ships");
  const ctx = canvasRef?.current?.getContext("2d");

  useEffect(() => {
    if (isGameTime) {
      setIsDrawing(false);
      setIsDragging(false);
    }
  }, [isGameTime]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMouseCoordinates(event, canvasRef);
    setLatestStartPoint({ x, y });
    setLatestEndPoint({ x, y });
    setIsDrawing(true);

    if (isCursorOverShip && !isGameTime) {
      setIsDrawing(false);
      setIsDragging(true);

      // if MouseDown and we're over a drawn Ship, change cursor to indicate we can Drag it
      if (shipsDiv) {
        shipsDiv.style.cursor = "grabbing";
      }

      // set mouse offset from the rectangle's top-left corner
      const { mouseOffsetX, mouseOffsetY } = getMouseOffsetCoordinates(
        event,
        shipPositions,
        canvasRef,
        currentlyActiveShip,
      );
      mouseOffsetRef.current = { x: mouseOffsetX, y: mouseOffsetY };
    }
  };

  const mouseHighlight = (
    x: number,
    y: number,
    ctx: CanvasRenderingContext2D,
  ) => {
    const activeRow = Math.floor(x / GRID_CELL_SIZE) + 1;
    const activeColumn = Math.floor(y / GRID_CELL_SIZE) + 1;

    if (x > 0) {
      highlightCell.current = {
        x: activeRow * GRID_CELL_SIZE - GRID_CELL_SIZE,
        y: activeColumn * GRID_CELL_SIZE - GRID_CELL_SIZE,
        width: GRID_CELL_SIZE,
        height: GRID_CELL_SIZE,
      };

      if (ctx) {
        drawRectangle(ctx, highlightCell.current, true);
      }
    }
  };

  const handleMouseLeave = () => {
    if (ctx && (highlightCell.current.x || highlightCell.current.y)) {
      ctx.clearRect(highlightCell.current.x, highlightCell.current.y, 50, 50);
    }
    highlightCell.current = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      currentlyActive: false,
    };
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMouseCoordinates(event, canvasRef);

    if (!isDragging && !isDrawing && ctx) {
      // mouseHighlight(x, y, ctx);
    }

    if (ctx) {
      // detect if Mouse cursor is over any drawn Ships
      for (let i = 0; i < shipPositions?.length; i++) {
        // loop over every ship
        const ship = shipPositions[i];
        if (
          x > ship.x &&
          x < ship.x + ship.width &&
          y > ship.y &&
          y < ship.y + ship.height
        ) {
          setIsCursorOverShip(true);
          // see ship, mille peal kursor on, peaks olema aktiivne
          currentlyActiveShip.current = { ...ship, currentlyActive: true };
          break;
        } else {
          setIsCursorOverShip(false);
          currentlyActiveShip.current = { ...ship, currentlyActive: false };
        }
      }

      // drag already drawn ship
      if (isDragging && !isGameTime) {
        console.log(
          "currentlyActiveShip if isDragging",
          currentlyActiveShip.current,
        );
        console.log(ctx);
        dragShip({
          event,
          ctx,
          shipPositions,
          currentlyActiveShip,
          canvasRef,
          mouseOffsetRef,
          movedShips,
          movedShipRef,
        });
      }

      // change mouse cursor
      if (shipsDiv) {
        if (isCursorOverShip) {
          shipsDiv.style.cursor = "grab"; // use "grabbing" while active
        } else {
          shipsDiv.style.cursor = "default";
        }
      }

      if (!isDrawing) return;

      mousePathRef.current.push({ x, y });
      setLatestEndPoint({ x, y });

      ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT); //clear canvas
      shipPositions?.forEach((rect) => drawRectangle(ctx, rect)); // Redraw all completed rectangles
      const drawnWidth = x - latestStartPoint.x;
      const drawnHeight = y - latestStartPoint.y;
      const widthInCells = Math.floor(Math.abs(drawnWidth / GRID_CELL_SIZE));
      const heightInCells = Math.floor(Math.abs(drawnHeight / GRID_CELL_SIZE));
      const largestAvailableShip = availableShipSizes.length
        ? Math.max(...availableShipSizes)
        : 0;
      const smallestAvailableShip = availableShipSizes.length
        ? Math.min(...availableShipSizes)
        : 0;

      // 1. Determine direction based on largest movement
      const absDrawnWidth = Math.abs(drawnWidth);
      const absDrawnHeight = Math.abs(drawnHeight);
      let isHorizontal = false;
      let isVertical = false;

      // Only determine orientation if the user has dragged at least one cell in either direction

      //added ist condition and halved the other check so it runs of the draw square is at least half of 1 full square
      if (
        absDrawnWidth >= 25 &&
        absDrawnHeight >= 25 &&
        (absDrawnWidth >= GRID_CELL_SIZE / 2 ||
          absDrawnHeight >= GRID_CELL_SIZE / 2)
      ) {
        console.log("setting isHorizontal and isVertical");
        if (absDrawnWidth > absDrawnHeight) {
          isHorizontal = true;
        } else {
          isVertical = true;
        }
      }

      console.group();
      console.log("isVertical: ", isVertical);
      console.log("isHorizontal: ", isHorizontal);
      console.groupEnd();

      // 2. Validate against available sizes and direction
      let isValid = false;

      if (
        isHorizontal &&
        // absDrawnHeight < 50 &&
        absDrawnHeight < 60 && // give some wiggle room when drawing
        absDrawnHeight >= 25 &&
        absDrawnWidth < largestAvailableShip * GRID_CELL_SIZE &&
        widthInCells >= smallestAvailableShip - 1 &&
        absDrawnWidth > 75 // make sure the width is at least 1.5 cells
      ) {
        isValid = true;
        ctx.fillStyle = isValid ? "blue" : "rgba(255, 0, 0, 0.3)";
        ctx.fillRect(
          latestStartPoint.x,
          latestStartPoint.y,
          drawnWidth,
          drawnHeight,
        );
      } else if (
        isVertical &&
        // absDrawnWidth < 50 &&
        absDrawnWidth < 60 && // give some wiggle room when drawing
        absDrawnWidth >= 25 &&
        absDrawnHeight < largestAvailableShip * GRID_CELL_SIZE &&
        heightInCells >= smallestAvailableShip - 1 &&
        absDrawnHeight > 75 // make sure the height is at least 1.5 cells
      ) {
        isValid = true;
        ctx.fillStyle = isValid ? "blue" : "rgba(255, 0, 0, 0.3)";
        ctx.fillRect(
          latestStartPoint.x,
          latestStartPoint.y,
          drawnWidth,
          drawnHeight,
        );
      }
      ctx.fillStyle = isValid ? "blue" : "rgba(255, 0, 0, 0.3)";

      console.group();
      console.log("isValid", isValid);
      console.log("isVertical", isVertical);
      console.log("isHorizontal", isHorizontal);
      console.log("heightInCells", heightInCells);
      console.log("widthInCells", widthInCells);
      console.log("absDrawnWidth", absDrawnWidth);
      console.log("absDrawnHeight", absDrawnHeight);
      console.groupEnd();
      console.log("drawing");

      const shipExceedsMaxSize = isHorizontal
        ? Math.floor(widthInCells) >= largestAvailableShip - Number.EPSILON
        : Math.floor(heightInCells) >= largestAvailableShip - Number.EPSILON;

      if (shipExceedsMaxSize) {
        const drawnWidth = lastValidRef.current.x - latestStartPoint.x;
        const drawnHeight = lastValidRef.current.y - latestStartPoint.y;

        console.log(
          "shipExceedsMaxSize:  drawing",
          shipExceedsMaxSize,
          drawnWidth,
        );
        ctx.fillStyle = "rgba(105, 219, 28, 0.5)";
        ctx.fillRect(
          latestStartPoint.x,
          latestStartPoint.y,
          Math.ceil(drawnWidth),
          Math.ceil(drawnHeight),
        );
      } else {
        console.log("else does NOT exeed maxSize drawing");
        lastValidRef.current = { x: x, y: y };
        ctx.fillRect(
          latestStartPoint.x,
          latestStartPoint.y,
          drawnWidth,
          drawnHeight,
        );
      }
    }
  };

  const handleMouseUp = () => {
    if (ctx) {
      // if we drag a ship on Canvas, then re-snap it to grid after mouseUp
      if (isDragging) {
        const snappedShips = snapMovedShipToGrid(shipPositions);
        clearAndRedrawAll(ctx, snappedShips);
        setShipPositions(snappedShips);
      }

      setIsDrawing(false);
      setIsDragging(false);

      if (
        Math.abs(latestStartPoint.x - latestEndPoint.x) > 0 &&
        Math.abs(latestStartPoint.y - latestEndPoint.y) > 0
      ) {
        //determine what direction we're drawing from
        let isDrawnRightToLeft = latestStartPoint.x > latestEndPoint.x;
        let isDrawnBottomToTop = latestStartPoint.y > latestEndPoint.y;

        // get correct x/y position based on drawing direction
        const xPosition = isDrawnRightToLeft
          ? latestEndPoint.x
          : latestStartPoint.x;
        const yPosition = isDrawnBottomToTop
          ? latestEndPoint.y
          : latestStartPoint.y;

        // ^ we need to check if VERTICAL and then make sure we apply correct max width/height

        // get drawn Ship's width and height
        const drawnWidth = roundToNearest(
          Math.abs(latestStartPoint.x - latestEndPoint.x),
        );
        const drawnHeight = roundToNearest(
          Math.abs(latestStartPoint.y - latestEndPoint.y),
        );

        const isHorizontalShip =
          drawnHeight === GRID_CELL_SIZE && drawnWidth >= GRID_CELL_SIZE;
        const largestAvailableShip =
          (availableShipSizes.length ? Math.max(...availableShipSizes) : 0) *
          GRID_CELL_SIZE;
        const smallestAvailableShip =
          (availableShipSizes.length ? Math.min(...availableShipSizes) : 0) *
          GRID_CELL_SIZE;

        // check if drawn Ship is bigger than the max allowed Ship
        const shipExceedsMaxSize = isHorizontalShip
          ? roundToNearest(Math.abs(latestStartPoint.x - latestEndPoint.x)) >=
            largestAvailableShip
          : roundToNearest(Math.abs(latestStartPoint.y - latestEndPoint.y)) >=
            largestAvailableShip;

        setShipPositions((prevShipPositions) => {
          const shipSize = shipExceedsMaxSize
            ? isHorizontalShip
              ? largestAvailableShip / GRID_CELL_SIZE
              : largestAvailableShip / GRID_CELL_SIZE
            : isHorizontalShip
              ? drawnWidth / GRID_CELL_SIZE
              : drawnHeight / GRID_CELL_SIZE;

          // on MouseUp, once we've drawn the Ship, make it 'snap' to fill the nearest Square
          const shipTooSmall = isHorizontalShip
            ? drawnWidth < smallestAvailableShip
            : drawnHeight < smallestAvailableShip;

          console.log(
            "%c shipTooSmall",
            "color: purple; font-size: 14px;",
            drawnWidth,
            smallestAvailableShip,
            drawnWidth < smallestAvailableShip,
          );

          const recalculatedShipWidth = shipTooSmall
            ? smallestAvailableShip
            : isHorizontalShip && shipExceedsMaxSize
              ? largestAvailableShip
              : roundToNearest(Math.abs(latestStartPoint.x - latestEndPoint.x));
          // ^ we need to check if VERTICAL and then make sure we apply correct max width/height

          const generateSectionsObj = {
            size: isHorizontalShip
              ? recalculatedShipWidth / GRID_CELL_SIZE
              : drawnHeight / GRID_CELL_SIZE,
            isHorizontalShip,
            xPosition,
            yPosition,
            gridCellSize: GRID_CELL_SIZE,
          };

          const generateCellsObj = {
            size: isHorizontalShip
              ? recalculatedShipWidth / GRID_CELL_SIZE
              : drawnHeight / GRID_CELL_SIZE,
            isHorizontalShip,
            xPosition,
            yPosition,
          };

          const updatedShipPositions = [
            ...prevShipPositions,
            {
              x: roundToNearest(xPosition),
              y: roundToNearest(yPosition),
              width: recalculatedShipWidth,
              height:
                !isHorizontalShip && shipExceedsMaxSize
                  ? largestAvailableShip
                  : roundToNearest(
                      Math.abs(latestStartPoint.y - latestEndPoint.y),
                    ),
              currentlyActive: false,
              size: shipTooSmall
                ? smallestAvailableShip / GRID_CELL_SIZE
                : shipSize,
              isHorizontal: isHorizontalShip,
              isDestroyed: false,
              sections: generateSections(generateSectionsObj),
              cells4: generateShipCells(generateCellsObj),
            },
          ];

          // clear all Ships and redraw the new 'snapped' Ships
          if (ctx) {
            ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
            // Redraw all completed Ships
            updatedShipPositions.forEach((rect) => drawRectangle(ctx, rect));
          }
          checkStockShips(updatedShipPositions);
          return updatedShipPositions;
        });

        console.group();
        console.log(
          "original x:",
          xPosition,
          "rounded X: ",
          roundToNearest(xPosition),
        );
        console.log(
          "original y:",
          yPosition,
          "rounded y: ",
          roundToNearest(yPosition),
        );
        console.groupEnd();
        console.log("mouseup shipPositions", shipPositions);
      }

      if (ctx) {
        ctx.fillStyle = "green";
      }

      if (isCursorOverShip && shipsDiv) {
        shipsDiv.style.cursor = "grab";
      }
    }
  };

  const checkStockShips = (ships: Ship[]) => {
    ships.forEach((ship: Ship) => {
      const shipSize = ship.size || 0;
      if (availableShipSizes.includes(shipSize)) {
        const index = availableShipSizes.indexOf(shipSize);
        const modifiedSizes = availableShipSizes.toSpliced(index, 1);
        setAvailableShipSizes(modifiedSizes);
      }
    });
  };

  const handleReset = () => {
    if (ctx) {
      ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
    }
    setAvailableShipSizes(SHIP_SIZES);
    dispatch({
      type: "RESET_PLAYER_SHIPS",
      ships: [],
    });
    setShipPositions([]);
    movedShips.current = [];
    mouseOffsetRef.current = INITIAL_COORDS;
    movedShipRef.current = INITIAL_SHIP_PROPS;
    mousePathRef.current = [INITIAL_COORDS];
    currentlyActiveShip.current = INITIAL_ACTIVE_SHIP;
    highlightCell.current = INITIAL_HIGHLIGHT_CELL;
    lastValidRef.current = INITIAL_COORDS;
    setIsDrawing(false);
    setIsDragging(false);
    setIsCursorOverShip(false);
    setLatestStartPoint(INITIAL_COORDS);
    setLatestEndPoint(INITIAL_COORDS);
  };

  return (
    <>
      <button
        // disabled={shipPositions.length < 5}
        onClick={() => handleBeginGame(shipPositions)}
        className={styles.startGameBtn}
      >
        START GAME
      </button>
      <canvas
        ref={canvasRef}
        style={{ top: `${cellSize - 1}px`, left: `${cellSize - 1}px` }}
        id={id}
        width={canvasSize}
        height={canvasSize}
        className={styles[className]}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        // onPointerDown={handleMouseDown}
        // onPointerMove={handleMouseMove}
        // onPointerUp={handleMouseUp}
        // onPointerLeave={handleMouseLeave}
      />
      <div className={styles.availableSizes}>
        Available ship sizes left:
        {availableShipSizes.map((ship, i) => (
          <span key={i}>{ship}</span>
        ))}
      </div>
      {shipPositions.length > 0 && (
        <button className={styles.resetButton} onClick={handleReset}>
          Reset
        </button>
      )}
    </>
  );
};

export default ShipPlacementCanvas;
