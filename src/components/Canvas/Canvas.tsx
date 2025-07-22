import { useEffect, useRef, useState } from "react";

import clsx from "clsx";

import { drawRectangle, getMouseCoordinates } from "../../utils/canvasUtils";

import styles from "./Canvas.module.css";

interface CanvasProps {
  width?: number;
  height?: number;
  id: string;
  isGrid?: boolean;
  className?: string;
  gridCellSize?: number;
  isPlayground?: boolean;
  pink?: boolean;
  blue?: boolean;
  startingPoint?: number;
  isCoordinates?: boolean;
  isShipyard?: boolean;
  isShips?: boolean;
  shipp?: boolean;
  setShips?: () => void;
  isHighlight?: boolean;
}

interface Ship {
  x: number;
  y: number;
  width: number;
  height: number;
  currentlyActive?: boolean;
}

interface CoordinatePoints {
  x: number;
  y: number;
}

const Canvas = ({
  width = 500,
  height = 500,
  id,
  isGrid = false,
  className = "",
  gridCellSize = 50,
  isPlayground = false,
  pink = false,
  blue = false,
  startingPoint = 0,
  isCoordinates = false,
  isShipyard = false,
  isShips = false,
  shipp = false,
  isHighlight = false,
  setShips,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const movedShips = useRef<Ship[]>([]);
  const mouseOffsetRef = useRef<CoordinatePoints>({ x: 0, y: 0 });
  const movedShipRef = useRef<Ship>({ x: 0, y: 0, width: 0, height: 0 });
  const mousePathRef = useRef<CoordinatePoints[]>([{ x: 0, y: 0 }]);
  const currentlyActiveShip = useRef<Ship>({ x: 0, y: 0, width: 0, height: 0, currentlyActive: false });
  const highlightCell = useRef<Ship>({ x: 0, y: 0, width: 0, height: 0, currentlyActive: false });

  // const highlightCanvasRef = useRef<HTMLCanvasElement | null>(null);

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
  // const [adjustedShipPositions, setAdjustedShipPositions] = useState<Ship[]>(
  //   [],
  // );
  const shipsDiv = document.getElementById("ships");

  // const getMouseCoordinates = (event: MouseEvent) => {
  //   const rect = canvasRef?.current?.getBoundingClientRect();
  //   const x = event.clientX - (rect?.left || 0);
  //   const y = event.clientY - (rect?.top || 0);

  //   return { x, y };
  // };

  const getMouseOffsetCoordinates = (event: MouseEvent) => {
    const { x, y } = getMouseCoordinates(event);
    const latestShip: Ship = shipPositions[shipPositions.length - 1] || {};

    return {
      mouseOffsetX: x - latestShip.x,
      mouseOffsetY: y - latestShip.y,
    };
  };

  const handleMouseDown = (event: MouseEvent) => {
    const { x, y } = getMouseCoordinates(event);
    setLatestStartPoint({ x, y });
    setLatestEndPoint({ x, y });
    setIsDrawing(true);

    if (isCursorOverShip) {
      setIsDrawing(false);
      setIsDragging(true);

      if (shipsDiv) {
        shipsDiv.style.cursor = "grabbing";
      }

      // set mouse offset from the rectangle's top-left corner
      const { mouseOffsetX, mouseOffsetY } = getMouseOffsetCoordinates(event);
      mouseOffsetRef.current = { x: mouseOffsetX, y: mouseOffsetY };
    }
  };

  const roundToNearest = (num: number) => Math.round(num / 50) * 50;

  // const drawRectangle = (ctx, rect, isHighlight) => {
  //   ctx.beginPath();
  //   ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  //   console.log('drawing: ', rect.x, rect.y, rect.width, rect.height);
  //   ctx.fillStyle = isHighlight ? "rgba(247, 234, 136, 0.1)" : "purple";
  //   ctx.lineWidth = 2;
  //   ctx.stroke();
  // };

  const dragShip = (event: MouseEvent, ctx: CanvasRenderingContext2D) => {
    const rect = canvasRef?.current?.getBoundingClientRect();
    const { x, y } = getMouseCoordinates(event);

    // console.log("dragging", isDragging);

    if (ctx) {
      const latestShip: Ship = shipPositions[shipPositions.length - 1] || {}; // need to change this, othrwise no matter which ship i drag, only the latest one moves

      // const latestShip = movedShipRef.current;
      console.log(latestShip);
      const { x, y } = getMouseCoordinates(event);
      const newX = x - mouseOffsetRef.current.x;
      const newY = y - mouseOffsetRef.current.y;

      ctx.clearRect(0, 0, 500, 500);
      ctx.fillStyle = "red";
      ctx.fillRect(newX, newY, latestShip.width, latestShip.height);
      latestShip.x = newX;
      latestShip.y = newY;
      console.log("%c New Rectangle Position:", 'color: green', newX, newY);


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
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    const ctx = canvasRef?.current?.getContext("2d");
    const { x, y } = getMouseCoordinates(event);

    if (isHighlight) {
      const activeRow = Math.floor(x / gridCellSize) + 1;
      const activeColumn = Math.floor(y / gridCellSize) + 1;
      console.log(Math.floor(x / 50) + 1);
      console.log(Math.floor(y / 50) + 1);
  
      if (x > 0) {
        highlightCell.current = {
          x: (activeRow * gridCellSize) - gridCellSize,
          y: (activeColumn * gridCellSize) - gridCellSize,
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
        currentlyActiveShip.current = {...ship, currentlyActive: true};
        break;
      } else {
        setIsCursorOverShip(false);
        // updatedShip = {
        //   ...updatedShip,
        //   currentlyActive: false,
        // };
        currentlyActiveShip.current = {...ship, currentlyActive: false};
      }
      
      console.log('currentlyActiveShip in for', currentlyActiveShip.current);
      // shipPositions[i] = updatedShip;
      // setShipPositions(shipPositions);
      // console.log(shipPositions[0]);
    }

    if (isDragging) {
      console.log('currentlyActiveShip if isDragging', currentlyActiveShip.current);
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

  const handleMouseUp = (event: MouseEvent) => {
    setIsDrawing(false);
    setIsDragging(false);
    // shipPositions.push([
    //   {
    //     start: latestStartPoint,
    //     end: currentPoint,
    //   },
    // ]);

    const { x, y } = getMouseCoordinates(event);

    console.log('mouseup x, y', x, y);

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
        currentlyActive: false
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
    checkStockShips();

    if (isCursorOverShip) {
      if (shipsDiv) {
        shipsDiv.style.cursor = "grab";
      }
    }
  };

  useEffect(() => {
    // console.log('useeffect isCoordinates', isCoordinates);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawGrid(ctx, width, height);
        if (isCoordinates) {
          // console.log('draw  coordinates');
          drawCoordinates(ctx, width, height);
        }
        if (isShipyard) {
          drawShips(ctx, width, height);
        }
        // rect(x, y, width, height)
      }
    }
  }, [isCoordinates]);

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ) => {
    const cellSize = gridCellSize; // Size of each cell in the grid
    // Set grid color and line width
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;

    // Draw vertical lines
    // console.log(startingPoint);
    for (let x = startingPoint; x <= canvasWidth; x += cellSize) {
      ctx.moveTo(x, 0);
      if (isCoordinates) {
        ctx.lineTo(x, 50);
      } else {
        ctx.lineTo(x, canvasHeight);
      }
    }

    // Draw horizontal lines
    for (let y = startingPoint; y <= canvasHeight; y += cellSize) {
      ctx.moveTo(0, y);
      if (isCoordinates) {
        ctx.lineTo(50, y);
      } else {
        ctx.lineTo(canvasWidth, y);
      }
    }

    ctx.stroke(); // Draw the lines on the canvas
  };

  const drawNumbers = (ctx: CanvasRenderingContext2D) => {
    // console.log('drawCoordinates');
    for (let i = 0; i < 10; i++) {
      const spacing = 90;
      const x = 25;
      const y = i === 0 ? spacing : i * 50 + spacing;
      ctx.font = "45px serif";
      ctx.textAlign = "center";
      ctx.fillText(`${i + 1}`, x, y);
      // fillText(text, x, y [, maxWidth])
    }
  };

  const drawLetters = (ctx: CanvasRenderingContext2D) => {
    const letters = "ABCDEFGHIJ";
    for (let i = 0; i < letters.length; i++) {
      const spacing = 75;
      const y = 40;
      const x = i === 0 ? spacing : i * 50 + spacing;
      ctx.font = "45px serif";
      ctx.textAlign = "center";
      ctx.fillText(letters[i], x, y);
    }
  };

  const drawCoordinates = (ctx: CanvasRenderingContext2D) => {
    // const cellSize = gridCellSize; // Size of each cell in the grid

    // Set grid color and line width
    ctx.strokeStyle = "pink";
    // ctx.lineWidth = 1;

    // Draw vertical lines
    // console.log(startingPoint);

    ctx.beginPath(); // Define a new path
    ctx.moveTo(50, 0); // Set a start-point
    ctx.lineTo(600, 0); // Set an end-point
    ctx.closePath();

    // ctx.beginPath(); // Define a new path
    ctx.moveTo(0, 50); // Set a start-point
    ctx.lineTo(0, 600); // Set an end-point
    ctx.closePath();

    ctx.lineWidth = 5;

    ctx.stroke(); // Draw the lines on the canvas

    if (isCoordinates) {
      drawNumbers(ctx);
      drawLetters(ctx);
    }
  };

  const checkStockShips = () => {
    // const shipSizes = [5, 4, 3, 3, 2];
    // const currentShipSizes = adjustedShipPositions.map((ship) => ship[0].height / 50);
    // console.log("currentShipSizes", currentShipSizes);
    // const availableShips = shipSizes.filter((shipSize) => {
    //   return !currentShipSizes.includes(shipSize);
    // });
    // console.log("availableShips", availableShips);
  };

  const drawShips = (ctx: CanvasRenderingContext2D) => {
    const shipSizes = [5, 4, 3, 3, 2];

    for (let i = 0; i < shipSizes.length; i++) {
      const shipSize = shipSizes[i];

      ctx.beginPath();
      ctx.fillStyle = "yellow";
      ctx.fillRect(i * 50 + 50 * i, 50, 50, 50 * shipSize);
      ctx.stroke();
    }
  };

  const propsToPass = {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    // onMouseLeave: handleMouseUp,
    // Add more props here if needed
  };

  // console.log(isShips ? propsToPass : {});

  return (
    <>
      <canvas
        ref={canvasRef}
        id={id}
        width={width}
        height={height}
        className={clsx(styles[className], {
          [styles.grid]: isGrid,
          [styles.playground]: isPlayground,
          [styles.pink]: pink,
          [styles.blue]: blue,
          [styles.shipp]: shipp,
        })}
        {...((isShips || isHighlight) ? propsToPass : {})}
      />
      <p></p>
    </>
  );
};

export default Canvas;
