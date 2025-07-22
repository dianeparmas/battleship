import React, { useEffect, useRef, useState } from "react";

import {
  drawRectangle,
  getMouseCoordinates,
  getMouseOffsetCoordinates,
} from "../../../utils/canvasUtils";

import {
  CanvasProps,
  CoordinatePoints,
  Ship,
} from "../../../types/battleship.types";

import styles from "./HighlightCanvas.module.css";

const HighlightCanvas = ({
  width = 500,
  height = 500,
  id,
  className = "",
  gridCellSize = 50,
  isHighlight = false,
  setShips,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const movedShips = useRef<Ship[]>([]);
  const mouseOffsetRef = useRef<CoordinatePoints>({ x: 0, y: 0 });
  const movedShipRef = useRef<Ship>({ x: 0, y: 0, width: 0, height: 0 });
  const mousePathRef = useRef<CoordinatePoints[]>([{ x: 0, y: 0 }]);
  const currentlyActiveShip = useRef<Ship>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    currentlyActive: false,
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
  const [isCursorOverShip, setIsCursorOverShip] = useState(false);
  const [latestStartPoint, setLatestStartPoint] = useState<CoordinatePoints>({
    x: 0,
    y: 0,
  });
  const [latestEndPoint, setLatestEndPoint] = useState<CoordinatePoints>({
    x: 0,
    y: 0,
  });
  const [shipPositions, setShipPositions] = useState([]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMouseCoordinates(event, canvasRef);
    setLatestStartPoint({ x, y });
    setLatestEndPoint({ x, y });
    setIsDrawing(true);

    if (isCursorOverShip) {
      setIsDrawing(false);
      setIsDragging(true);

      // set mouse offset from the rectangle's top-left corner
      const { mouseOffsetX, mouseOffsetY } = getMouseOffsetCoordinates(
        event,
        [],
        canvasRef,
      );
      mouseOffsetRef.current = { x: mouseOffsetX, y: mouseOffsetY };
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef?.current?.getContext("2d");
    const { x, y } = getMouseCoordinates(event, canvasRef);

    if (isHighlight) {
      const activeRow = Math.floor(x / gridCellSize) + 1;
      const activeColumn = Math.floor(y / gridCellSize) + 1;
      console.log(Math.floor(x / 50) + 1);
      console.log(Math.floor(y / 50) + 1);

      if (x > 0) {
        highlightCell.current = {
          x: activeRow * gridCellSize - gridCellSize,
          y: activeColumn * gridCellSize - gridCellSize,
          width: gridCellSize,
          height: gridCellSize,
        };
        drawRectangle(ctx, highlightCell.current, true);
      }
    }

    for (let i = 0; i < shipPositions.length; i++) {
      const ship = shipPositions[i];
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

      console.log("currentlyActiveShip in for", currentlyActiveShip.current);
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

    if (!isDrawing) return;
    mousePathRef.current.push({ x, y });

    setLatestEndPoint({ x, y });

    // Check for direction change only if bypass starting point
    const isMovingBackwardsPassedX = x < latestStartPoint.x; // Moving left
    const isMovingBackwardsPassedY = y < latestStartPoint.y; // Moving up

    // -2 not -1 because the 1st coordinates are initial values so they are useless
    const lastMouseMoveCoordinates =
      mousePathRef.current[mousePathRef.current.length - 2] || {};
    const isMovingBackwardsX = x < lastMouseMoveCoordinates.x; // Moving left
    const isMovingBackwardsY = y < lastMouseMoveCoordinates.y; // Moving up
    const isMovingBackwards = isMovingBackwardsX || isMovingBackwardsY;

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
    shipPositions.forEach((rect) => drawRectangle(ctx, rect));

    // ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // console.group();
    // console.log('latestStartPoint', latestStartPoint);
    // console.log('latestEndPoint', latestEndPoint);
    // console.log('x, y ', x, y);
    // console.log('result x y width height: ', latestStartPoint.x, latestStartPoint.y, x - latestStartPoint.x, y - latestStartPoint.y,);
    // console.log('isMovingBackwards', isMovingBackwards);
    // console.log('lastMouseMoveCoordinates', lastMouseMoveCoordinates);
    // console.groupEnd();

    if (ctx) {
      ctx.fillRect(
        latestStartPoint.x,
        latestStartPoint.y,
        x - latestStartPoint.x,
        y - latestStartPoint.y,
      );
      // ctx.fillRect(
      //   isMovingBackwards ? latestEndPoint.x : latestStartPoint.x,
      //   isMovingBackwards ? latestEndPoint.x : latestStartPoint.y,
      //   x - latestStartPoint.x,
      //   y - latestStartPoint.y,
      // );
      ctx.fillStyle = "pink";
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(false);
    setIsDragging(false);
    // shipPositions.push([
    //   {
    //     start: latestStartPoint,
    //     end: currentPoint,
    //   },
    // ]);

    const { x, y } = getMouseCoordinates(event);

    console.log("mouseup x, y", x, y);

    if (
      Math.abs(latestStartPoint.x - latestEndPoint.x) > 0 &&
      Math.abs(latestStartPoint.y - latestEndPoint.y) > 0
    ) {
      let isDrawnRightToLeft = latestStartPoint.x > latestEndPoint.x;
      let isDrawnBottomToTop = latestStartPoint.y > latestEndPoint.y;

      shipPositions.push({
        x: isDrawnRightToLeft ? latestEndPoint.x : latestStartPoint.x,
        y: isDrawnBottomToTop ? latestEndPoint.y : latestStartPoint.y,
        width: Math.abs(latestStartPoint.x - latestEndPoint.x),
        height: Math.abs(latestStartPoint.y - latestEndPoint.y),
        currentlyActive: false,
      });
    }

    // adjusted ship positions
    // adjustedShipPositions.push({
    //   x: roundToNearest(latestStartPoint.x),
    //   y: roundToNearest(latestStartPoint.y),
    //   width:
    //     roundToNearest(Math.abs(latestStartPoint.x - currentPoint.x)) === 0
    //       ? 50
    //       : roundToNearest(Math.abs(latestStartPoint.x - currentPoint.x)),
    //   height:
    //     roundToNearest(Math.abs(latestStartPoint.y - currentPoint.y)) === 0
    //       ? 50
    //       : roundToNearest(Math.abs(latestStartPoint.y - currentPoint.y)),
    // });

    const latestShip: Ship = shipPositions[shipPositions.length - 1] || {};
    // adjusted ship positions
    // const latestAdjustedShip =
    //   adjustedShipPositions[adjustedShipPositions.length - 1] || [];

    console.log("latestShip shipPositions", latestShip, shipPositions);

    const ctx = canvasRef?.current?.getContext("2d");
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
  };

  useEffect(() => {
    console.log("useeffect HighlightCanvas empty dependency array");
  }, []);

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
      />
      <p></p>
    </>
  );
};

export default HighlightCanvas;
