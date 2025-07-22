import React, { useEffect, useRef, useState } from "react";

import {
  drawRectangle,
  getMouseCoordinates,
  getMouseOffsetCoordinates,
  roundToNearest,
} from "../../../utils/canvasUtils";

import {
  CanvasProps,
  CoordinatePoints,
  Ship,
} from "../../../types/battleship.types";

import styles from "./BattleshipsCanvas.module.css";

const BattleshipsCanvas = ({
  width = 500,
  height = 500,
  id,
  className = "",
  gridCellSize = 50,
  setShips,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const movedShips = useRef<Ship[]>([]);
  const mouseOffsetRef = useRef<CoordinatePoints>({ x: 0, y: 0 });
  const movedShipRef = useRef<Ship>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    size: 0,
  });
  const mousePathRef = useRef<CoordinatePoints[]>([{ x: 0, y: 0 }]);
  const currentlyActiveShip = useRef<Ship>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    currentlyActive: false,
    size: 0,
  });
  const highlightCell = useRef<Ship>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    currentlyActive: false,
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [isCursorOverShip, setIsCursorOverShip] = useState(false);
  const [latestStartPoint, setLatestStartPoint] = useState<CoordinatePoints>({
    x: 0,
    y: 0,
  });
  const [latestEndPoint, setLatestEndPoint] = useState<CoordinatePoints>({
    x: 0,
    y: 0,
  });
  const [shipPositions, setShipPositions] = useState<Ship[]>([]);
  const [shipSizes, setShipSizes] = useState<number[]>([5, 4, 3, 3, 2]);
  const [availableShipSizes, setAvailableShipSizes] = useState<number[]>([5, 4, 3, 3, 2]);
  const shipsDiv = document.getElementById("ships");

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMouseCoordinates(event, canvasRef);
    setLatestStartPoint({ x, y });
    setLatestEndPoint({ x, y });
    setIsDrawing(true);
    setIsHighlighting(false);

    if (isCursorOverShip) {
      setIsDrawing(false);
      setIsDragging(true);

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

  const dragShip = (
    event: React.MouseEvent<HTMLCanvasElement>,
    ctx: CanvasRenderingContext2D,
  ) => {
    // const rect = canvasRef?.current?.getBoundingClientRect();
    // const { x, y } = getMouseCoordinates(event, canvasRef);

    // console.log("dragging", isDragging);

    if (ctx) {
      // const latestShip: Ship = shipPositions[shipPositions.length - 1] || {};

      const shipToMove = shipPositions.find(
        (ship) =>
          ship.x === currentlyActiveShip.current.x &&
          ship.y === currentlyActiveShip.current.y,
      );
      const latestShip = shipToMove || {};
      // need to change this, othrwise no matter which ship i drag, only the latest one moves

      // const latestShip = movedShipRef.current;
      // console.log('DRAG shipToMove', shipToMove);
      // console.log('DRAG latestShip', latestShip);
      // console.log('DRAG currentlyActiveShip', currentlyActiveShip.current);
      const { x, y } = getMouseCoordinates(event, canvasRef); // õige
      const newX = x - mouseOffsetRef.current.x;
      const newY = y - mouseOffsetRef.current.y;
      console.log('mouseoffcet x, y', x, y);
      console.log('mouseoffcet newX newY', newX, newY);

      ctx.clearRect(0, 0, 500, 500);
      ctx.fillStyle = "red";
      ctx.fillRect(newX, newY, latestShip.width, latestShip.height);
      latestShip.x = newX;
      latestShip.y = newY;
      console.log("%c New Rectangle Position:", "color: green", newX, newY);

      //------ try not to make other ships disappear
      // ctx.clearRect(0, 0, 500, 500);
      // Redraw all completed rectangles
      shipPositions.forEach((rect) => drawRectangle(ctx, rect));

      //-------

      // let isDrawnRightToLeft = latestStartPoint.x > latestEndPoint.x;
      // let isDrawnBottomToTop = latestStartPoint.y > latestEndPoint.y;

      // const shipOffsetX = latestStartPoint.x + mouseOffsetX; // kui + siis õige suund aga vale offset
      // const shipOffsetY = latestStartPoint.y + mouseOffsetY;
      // const { x, y } = getMouseCoordinates(event);
      // mouseOffsetX = x - latestShip.x;
      // mouseOffsetY = y - latestShip.y;
      // const shipOffsetX = latestStartPoint.x + mouseOffsetX; // kui + siis õige suund aga vale offset
      // const shipOffsetY = latestStartPoint.y + mouseOffsetY;

      // ctx.fillRect(
      //   shipOffsetX,
      //   shipOffsetY,
      //   latestShip.width,
      //   latestShip.height,
      // );
      // ctx.fillStyle = "red";
      // ctx.lineWidth = 2;

      movedShips.current.push({
        x: newX,
        y: newY,
        width: latestShip.width,
        height: latestShip.height,
      });

      movedShipRef.current = {
        x: newX,
        y: newY,
        width: latestShip.width,
        height: latestShip.height,
      };
      // console.log('movedShipRef.current', movedShipRef.current);
    }
  };

  const mouseHighlight = (
    x: number,
    y: number,
    ctx: CanvasRenderingContext2D,
  ) => {
    const activeRow = Math.floor(x / gridCellSize) + 1;
    const activeColumn = Math.floor(y / gridCellSize) + 1;

    if (x > 0) {
      highlightCell.current = {
        x: activeRow * gridCellSize - gridCellSize,
        y: activeColumn * gridCellSize - gridCellSize,
        width: gridCellSize,
        height: gridCellSize,
      };

      if (ctx) {
        drawRectangle(ctx, highlightCell.current, true);
      }
    }
  };

  const handleMouseLeave = () => {
    const ctx = canvasRef?.current?.getContext("2d");
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
    setIsHighlighting(false);
  };

  // const pushShipToState = (newShip: Ship) => {
  //   setShipPositions((prevShips) => {
  //     if (!prevShips) {
  //       console.error("Previous state is undefined!"); // Debugging
  //       return [newShip]; // Fallback to avoid breaking
  //     }
  //     const updatedShips = [...prevShips, newShip];
  //     console.log("Updated Items:", updatedShips);
  //     return updatedShips;
  //   });
  // };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef?.current?.getContext("2d");
    const { x, y } = getMouseCoordinates(event, canvasRef);

    if (!isDragging && !isDrawing) {
      setIsHighlighting(true);
    }

    if (isHighlighting && !isDragging && !isDrawing && ctx) {
      // mouseHighlight(x, y, ctx);
    }

    if (ctx) {
      for (let i = 0; i < shipPositions?.length; i++) {
        const ship = shipPositions[i];
        // console.log(ship);
        // let updatedShip = { ...ship };
        // for (let i = 0; i < adjustedShipPositions.length; i++) {
        //   const ship = adjustedShipPositions[i];
        // console.log(`mouse x: ${x}, y: ${y}`);
        // console.log(`ship x: ${ship.x}, ship y: ${ship.y}`);
        // console.log(`ship.x + ship.width: ${ship.x + ship.width}, ship.y + ship.height: ${ship.y + ship.height}`);
        // console.log(x > ship.x, x < ship.x + ship.width, y > ship.y, y < ship.y + ship.height);

        if (
          x > ship.x &&
          x < ship.x + ship.width &&
          y > ship.y &&
          y < ship.y + ship.height
        ) {
          setIsCursorOverShip(true);
          // updatedShip = {
          //   ...updatedShip,
          //   currentlyActive: true,
          // };
          // console.log('TRUE', updatedShip);

          // see ship, mille peal kursor on, peaks olema aktiivne
          currentlyActiveShip.current = { ...ship, currentlyActive: true };
          break;
        } else {
          setIsCursorOverShip(false);
          // updatedShip = {
          //   ...updatedShip,
          //   currentlyActive: false,
          // };
          currentlyActiveShip.current = { ...ship, currentlyActive: false };
        }

        // console.log("currentlyActiveShip in for", currentlyActiveShip.current);
        // shipPositions[i] = updatedShip;
        // setShipPositions(shipPositions);
        // console.log(shipPositions[0]);
      }

      if (isDragging) {
        console.log(
          "currentlyActiveShip if isDragging",
          currentlyActiveShip.current,
        );
        dragShip(event, ctx);
      }

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

      // Check for direction change only if bypass starting point
      // const isMovingBackwardsPassedX = x < latestStartPoint.x; // Moving left
      // const isMovingBackwardsPassedY = y < latestStartPoint.y; // Moving up

      // -2 not -1 because the 1st coordinates are initial values so they are useless
      // const lastMouseMoveCoordinates =
      //   mousePathRef.current[mousePathRef.current.length - 2] || {};
      // const isMovingBackwardsX = x < lastMouseMoveCoordinates.x; // Moving left
      // const isMovingBackwardsY = y < lastMouseMoveCoordinates.y; // Moving up
      // const isMovingBackwards = isMovingBackwardsX || isMovingBackwardsY;

      // should only clear the entire canvas if there are no other pre-existing ships
      /*if (!shipPositions.length) {
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      } else {
        if (isMovingBackwards) {
          ctx?.clearRect(latestStartPoint.x, latestStartPoint.y, x - latestStartPoint.x, y - latestStartPoint.y); // works only if i don't drag mouse backwards
        } else {
          ctx?.clearRect(latestStartPoint.x, latestStartPoint.y, x - latestStartPoint.x, y - latestStartPoint.y); // works only if i don't drag mouse backwards
        }
        
      }*/

      //  ai:

      ctx.clearRect(0, 0, 500, 500);
      // Redraw all completed rectangles
      shipPositions?.forEach((rect) => drawRectangle(ctx, rect));

      // ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      console.group();
      console.log(mousePathRef.current[mousePathRef.current.length - 1].x);
      // console.log('latestStartPoint', latestStartPoint);
      // console.log('latestEndPoint', latestEndPoint);
      // console.log('x, y ', x, y);
      // console.log('result x y width height: ', latestStartPoint.x, latestStartPoint.y, x - latestStartPoint.x, y - latestStartPoint.y,);
      console.log(
        "current width and height:",
        x - latestStartPoint.x,
        y - latestStartPoint.y,
      );
      console.groupEnd();

      const drawnWidth = x - latestStartPoint.x;
      const drawnHeight = y - latestStartPoint.y;

      // const widthInCells = Math.round(Math.abs(drawnWidth / gridCellSize));
      // const heightInCells = Math.round(Math.abs(drawnHeight / gridCellSize));
      const widthInCells = Math.floor(Math.abs(drawnWidth / gridCellSize));
      const heightInCells = Math.floor(Math.abs(drawnHeight / gridCellSize));
      const isHorizontal =
        heightInCells === 1 && widthInCells >= 2 && widthInCells <= 5;
      const isVertical =
        widthInCells === 1 && heightInCells >= 2 && heightInCells <= 5;

      console.log(
        "%c isHorizontal",
        "color: green;",
        heightInCells === 1,
        widthInCells >= 2,
        widthInCells <= 5,
      );
      // console.log('isVertical', isVertical);
      console.log("widthInCells", Math.abs(drawnWidth / 50));
      console.log("heightInCells ", Math.abs(drawnHeight / 50));
      if (!isHorizontal && !isVertical) {
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)"; // Highlight invalid rectangle
        ctx.fillRect(
          latestStartPoint.x,
          latestStartPoint.y,
          drawnWidth,
          drawnHeight,
        );
      }

      // const exceedsMaxShipLength = (drawnWidth > maxShipLength * gridCellSize) || (drawnHeight > maxShipLength * gridCellSize);
      // console.log('exceedsMaxShipLength', exceedsMaxShipLength);

      console.log("Math.floor(widthInCells)", Math.floor(widthInCells));
      const largestAvailableShip = availableShipSizes.length
        ? Math.max(...availableShipSizes)
        : 0;
      console.log(
        "%c largestAvailableShip",
        "font-size: 20px",
        largestAvailableShip,
      );
      ctx.fillStyle = "pink";
      if (Math.floor(widthInCells) >= largestAvailableShip - Number.EPSILON) {
        console.log("%c too long", "color: red");
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      }
      // ctx.fillRect(
      //   latestStartPoint.x,
      //   latestStartPoint.y,
      //   drawnWidth,
      //   drawnHeight,
      // );
      console.log(latestStartPoint.x, latestStartPoint.y, drawnWidth, drawnHeight);
      ctx.fillRect(
        latestStartPoint.x,
        latestStartPoint.y,
        drawnWidth,
        drawnHeight,
      );
      // ctx.fillRect(
      //   isMovingBackwards ? latestEndPoint.x : latestStartPoint.x,
      //   isMovingBackwards ? latestEndPoint.x : latestStartPoint.y,
      //   x - latestStartPoint.x,
      //   y - latestStartPoint.y,
      // );
    }
  };

  useEffect(() => {
    console.log("useEffect shipPositions", shipPositions);
  }, [shipPositions]);

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(false);
    setIsDragging(false);
    setIsHighlighting(true);

    const { x, y } = getMouseCoordinates(event, canvasRef);
    const ctx = canvasRef?.current?.getContext("2d");

    console.log("mouseup x, y", x, y);

    if (
      Math.abs(latestStartPoint.x - latestEndPoint.x) > 0 &&
      Math.abs(latestStartPoint.y - latestEndPoint.y) > 0
    ) {
      let isDrawnRightToLeft = latestStartPoint.x > latestEndPoint.x;
      let isDrawnBottomToTop = latestStartPoint.y > latestEndPoint.y;

      const xPosition = isDrawnRightToLeft
        ? latestEndPoint.x
        : latestStartPoint.x;
      const yPosition = isDrawnBottomToTop
        ? latestEndPoint.y
        : latestStartPoint.y;

      const drawnWidth = roundToNearest(Math.abs(latestStartPoint.x - latestEndPoint.x));
      const drawnHeight = roundToNearest(Math.abs(latestStartPoint.y - latestEndPoint.y),);
      const isHorizontalShip = drawnHeight === 50 && drawnWidth >= 50;
      const largestAvailableShip = (availableShipSizes.length ? Math.max(...availableShipSizes): 0) * 50;

      console.log(isHorizontalShip, roundToNearest(Math.abs(latestStartPoint.x - latestEndPoint.x)), largestAvailableShip); // kui drawid 6 siis TRUE ja 300
      const shipExceedsMaxSize = roundToNearest(Math.abs(latestStartPoint.x - latestEndPoint.x)) >= largestAvailableShip;
      console.log("shipExceedsMaxSize", shipExceedsMaxSize);

      setShipPositions((prevShipPositions) => {
        const updatedShipPositions = [
          ...prevShipPositions,
          // {
          //   x: roundToNearest(xPosition),
          //   y: roundToNearest(yPosition),
          //   width: roundToNearest(
          //     Math.abs(latestStartPoint.x - latestEndPoint.x),
          //   ),
          //   height: roundToNearest(
          //     Math.abs(latestStartPoint.y - latestEndPoint.y),
          //   ),
          //   currentlyActive: false,
          //   size: isHorizontalShip ? drawnWidth / 50 : drawnHeight / 50,
          // },
          {
            x: roundToNearest(xPosition),
            y: roundToNearest(yPosition),
            width: shipExceedsMaxSize
              ? largestAvailableShip
              : roundToNearest(Math.abs(latestStartPoint.x - latestEndPoint.x)),
            height: roundToNearest(
              Math.abs(latestStartPoint.y - latestEndPoint.y),
            ),
            currentlyActive: false,
            size: shipExceedsMaxSize
              ? isHorizontalShip
                ? largestAvailableShip / 50
                : largestAvailableShip / 50
              : isHorizontalShip
                ? drawnWidth / 50
                : drawnHeight / 50,
          },
        ];
        // handleUpdatedState(updatedItems); // React to the updated state

        if (ctx) {
          ctx.clearRect(0, 0, 500, 500);
          // Redraw all completed rectangles
          updatedShipPositions.forEach((rect) => drawRectangle(ctx, rect));
        }
        checkStockShips(updatedShipPositions);
        return updatedShipPositions; // Update the state
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

    const latestShip: Ship = shipPositions[shipPositions.length - 1] || {};
    // adjusted ship positions
    // const latestAdjustedShip =
    //   adjustedShipPositions[adjustedShipPositions.length - 1] || [];

    console.log("latestShip shipPositions", latestShip, shipPositions);

    // const ctx = canvasRef?.current?.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "green";

      // ctx.lineWidth = 2;

      // adjusted ship positions
      // ctx.clearRect(
      //   latestShip.x,
      //   latestShip.y,
      //   latestShip.width,
      //   latestShip.height,
      // );
      // console.log(latestAdjustedShip);
      // adjusted ship positions
      // ctx.fillRect(
      //   latestAdjustedShip.x,
      //   latestAdjustedShip.y,
      //   latestAdjustedShip.width,
      //   latestAdjustedShip.height,
      // );
    }

    setShips(shipPositions);
    console.log("mouseup");
    

    if (isCursorOverShip && shipsDiv) {
      shipsDiv.style.cursor = "grab";
    }
  };

  useEffect(() => {
    console.log("useeffect BattlehipsCanvas empty dependency array");
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // drawGrid(ctx, width, height);
      }
    }
  }, []);

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

  // const drawShipsInShipyard = (ctx: CanvasRenderingContext2D) => {
  //   const shipSizes = [5, 4, 3, 3, 2];

  //   for (let i = 0; i < shipSizes.length; i++) {
  //     const shipSize = shipSizes[i];

  //     ctx.beginPath();
  //     ctx.fillStyle = "yellow";
  //     ctx.fillRect(i * 50 + 50 * i, 50, 50, 50 * shipSize);
  //     ctx.stroke();
  //   }
  // };

  // const propsToPass = {
  //   onMouseDown: handleMouseDown,
  //   onMouseMove: handleMouseMove,
  //   onMouseUp: handleMouseUp,
  //   // onMouseLeave: handleMouseUp,
  //   // Add more props here if needed
  // };

  // console.log(isShips ? propsToPass : {});

  return (
    <>
      <canvas
        ref={canvasRef}
        id={id}
        width={width}
        height={height}
        className={styles[className]}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      <p></p>
    </>
  );
};

export default BattleshipsCanvas;
