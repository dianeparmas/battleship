import React, { useEffect, useRef, useState } from "react";

import { useTheme } from "../../../contexts/ThemeContext";

import {
  generateShipCells,
  generateSections,
  snapMovedShipToGrid,
} from "../../../helpers/battleshipHelpers";
import { dragShip } from "../../../helpers/dragShip";

import { CANVAS_SIZE } from "../../../constants/canvasConstants";
import mockBoard from "../../../assets/mockBoard";

import {
  clearAndRedrawAll,
  getMouseCoordinates,
  getMouseOffsetCoordinates,
  roundToNearest,
  coordsToGridCell,
} from "../../../utils/canvasUtils";

import { drawFloatingShips } from "../../../animations/animations";

import { drawInvalidLines, drawRectangle } from "../../../drawing/drawing";

import {
  CoordinatePoints,
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
  imageCache,
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
  const currentlyActiveShip = useRef(INITIAL_ACTIVE_SHIP);
  const highlightCell = useRef(INITIAL_HIGHLIGHT_CELL);
  const lastValidRef = useRef<CoordinatePoints | null>(INITIAL_COORDS);

  const [isDragging, setIsDragging] = useState(false);
  const [isCursorOverShip, setIsCursorOverShip] = useState(false);
  const [shipPositions, setShipPositions] = useState<Ship[]>([]);
  const [isError, setIsError] = useState(false);

  const { canvasSize, cellSize } = useTheme();

  const shipsDiv = document.getElementById("ships");
  const ctx = canvasRef?.current?.getContext("2d");

  useEffect(() => {
    if (ctx) {
      mockBoard.forEach((ship) => {
        // drawRectangle(ctx, ship);
        // ctx.beginPath();
        // ctx.arc(
        //   ship.x + ship.width + 10,
        //   ship.y + ship.height / 2,
        //   8,
        //   0,
        //   2 * Math.PI,
        // );
        // ctx.stroke();

        const floatingShipsParams = {
          ctx,
          ship,
          imageCache,
          isStatic: true,
        };
        drawFloatingShips(floatingShipsParams);
      });
      setShipPositions(mockBoard);
    }
  }, [ctx, imageCache]);

  useEffect(() => {
    if (isGameTime) {
      setIsDragging(false);
    }
  }, [isGameTime]);

  const checkShipCollision = (placedShips: Ship[], movedShip: Ship) => {
    const movedShipCells = new Set(movedShip.cells);
    let hasCollision = false;

    const updatedShips = placedShips.map((ship) => {
      const isColliding =
        ship.id !== movedShip.id &&
        ship.cells.some((cell) => movedShipCells.has(cell));

      if (isColliding) {
        hasCollision = true;
        if (ctx) {
          drawInvalidLines({ ctx, movedShip, collidingShip: ship });
        }
        return { ...ship, isCollision: true };
      }

      return { ...ship };
    });
    if (isError !== hasCollision) {
      setIsError(hasCollision);
    }

    const updatedMovedShip = {
      ...movedShip,
      isCollision: hasCollision,
    };
    const finalShips = updatedShips.map((ship) =>
      ship.id === movedShip.id ? updatedMovedShip : ship,
    );

    setShipPositions(finalShips);
  };

  const isOutOfBounds = (movedShip: Ship, updatedShipPositions) => {
    const movedShipId = movedShip.id;
    const movedShipCells = updatedShipPositions[movedShipId - 1].cells;
    return movedShipCells.includes(null);
  };

  const rotateShip = (ship: Ship) => {
    const newDirection = !ship.isHorizontal;
    const isOriginalShipHorizontal = ship.isHorizontal;
    const newWidth = isOriginalShipHorizontal
      ? ship.width / ship.size
      : ship.width * ship.size;
    const newHeight = isOriginalShipHorizontal
      ? ship.height * ship.size
      : ship.height / ship.size;

    const newSections = generateSections({
      size: ship.size,
      isHorizontalShip: newDirection,
      xPosition: ship.x,
      yPosition: ship.y,
    });
    const newCells = generateShipCells({
      size: ship.size,
      isHorizontalShip: newDirection,
      xPosition: ship.x,
      yPosition: ship.y,
    });

    const updatedMovedShip = {
      ...ship,
      width: newWidth,
      height: newHeight,
      isHorizontal: newDirection,
      sections: newSections,
      cells: newCells,
    };

    setShipPositions((prevShips) => {
      const updatedShipPositions = prevShips.map((originalShip) => {
        if (originalShip.x === ship.x && originalShip.y === ship.y) {
          // return {
          //   ...ship,
          //   width: newWidth,
          //   height: newHeight,
          //   isHorizontal: newDirection,
          //   sections: newSections,
          //   cells: newCells,
          // };
          return updatedMovedShip;
        } else {
          return originalShip;
        }
      });

      if (ctx) {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        updatedShipPositions.forEach((rect) => {
          // drawRectangle(ctx, rect);
          const floatingShipsParams = {
            ctx,
            ship: rect,
            imageCache,
            isStatic: true,
          };
          drawFloatingShips(floatingShipsParams);
        });
        // checkShipCollision(updatedShipPositions, {
        //   ...ship,
        //   width: newWidth,
        //   height: newHeight,
        //   isHorizontal: newDirection,
        //   sections: newSections,
        //   cells: newCells,
        // });
        checkShipCollision(updatedShipPositions, updatedMovedShip);
        const outOfBoundsShip = isOutOfBounds(ship, updatedShipPositions);
        if (outOfBoundsShip) {
          drawInvalidLines({ ctx, movedShip: updatedMovedShip });
        }
        if (isError !== outOfBoundsShip) {
          setIsError(outOfBoundsShip);
        }
        console.log(
          "isoutofbounds: ",
          outOfBoundsShip,
        );
      }
      return updatedShipPositions;
    });
  };

  const handleShipRotation = (event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log("double clic");
    const { x, y } = getMouseCoordinates(event, canvasRef);
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
          rotateShip(ship);
          break;
        } else {
          setIsCursorOverShip(false);
          currentlyActiveShip.current = { ...ship, currentlyActive: false };
        }
      }
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCursorOverShip && !isGameTime) {
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

  const handleMouseLeave = () => {
    console.log("mouseleave");
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

    //make sure only 1 ship can be dragged

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
      // ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT); //clear canvas
      // shipPositions?.forEach((rect) => drawRectangle(ctx, rect)); // Redraw all completed rectangles
    }
  };

  const handleMouseUp = () => {
    if (ctx) {
      // if we drag a ship on Canvas, then re-snap it to grid after mouseUp
      if (isDragging) {
        const snappedShips = snapMovedShipToGrid(shipPositions);
        clearAndRedrawAll(ctx, snappedShips, imageCache);
        console.log(
          "%c mouseup snappedShips",
          "font-size: 20px; color: red",
          snappedShips,
        );
        setShipPositions(snappedShips);

        if (ctx) {
          ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
          // Redraw all completed Ships
          // updatedShipPositions.forEach((rect) => drawRectangle(ctx, rect));
          snappedShips.forEach((rect) => {
            // drawRectangle(ctx, rect);
            const floatingShipsParams = {
              ctx,
              ship: rect,
              imageCache,
              isStatic: true,
            };
            drawFloatingShips(floatingShipsParams);
          });
        }
      }

      setIsDragging(false);

      if (isCursorOverShip && shipsDiv) {
        shipsDiv.style.cursor = "grab";
      }
    }
  };

  const handleReset = () => {
    if (ctx) {
      ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
    }
    dispatch({
      type: "RESET_PLAYER_SHIPS",
      ships: [],
    });
    setShipPositions([]);
    movedShips.current = [];
    mouseOffsetRef.current = INITIAL_COORDS;
    movedShipRef.current = INITIAL_SHIP_PROPS;
    currentlyActiveShip.current = INITIAL_ACTIVE_SHIP;
    highlightCell.current = INITIAL_HIGHLIGHT_CELL;
    lastValidRef.current = INITIAL_COORDS;
    setIsDragging(false);
    setIsCursorOverShip(false);
  };

  return (
    <>
      <button
        disabled={isError}
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
        onDoubleClick={handleShipRotation}
        // onPointerDown={handleMouseDown}
        // onPointerMove={handleMouseMove}
        // onPointerUp={handleMouseUp}
        // onPointerLeave={handleMouseLeave}
      />
      <button className={styles.resetButton} onClick={handleReset}>
        Reset
      </button>
      <p className={styles.instructions}>
        Double-click to rotate, drag to move position
      </p>
    </>
  );
};

export default ShipPlacementCanvas;
