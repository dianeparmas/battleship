import { dragShipParams } from "../types/dragShip.types";

import { getMouseCoordinates } from "../utils/canvasUtils";

import { drawRectangle } from "../drawing/drawing";

export const dragShip = ({
  event,
  ctx,
  shipPositions,
  currentlyActiveShip,
  canvasRef,
  mouseOffsetRef,
  movedShips,
  movedShipRef,
}: dragShipParams) => {
  console.log(
    `shipPositions: `,
    shipPositions,
    `currentlyActiveShip: `,
    currentlyActiveShip,
    `canvasRef: ${canvasRef}`,
    canvasRef,
    `mouseOffsetRef: ${mouseOffsetRef}`,
    mouseOffsetRef,
    `movedShips: ${movedShips}`,
    movedShips,
    `movedShipRef: ${movedShipRef}`,
    movedShipRef,
    `ctx: ${ctx}`,
    ctx,
  );

  if (ctx) {
    const shipToMove = shipPositions.find(
      (ship) =>
        ship.x === currentlyActiveShip.current.x &&
        ship.y === currentlyActiveShip.current.y,
    );
    const latestShip = shipToMove;

    const { x, y } = getMouseCoordinates(event, canvasRef);
    const newX = x - mouseOffsetRef.current.x;
    const newY = y - mouseOffsetRef.current.y;
    console.log("mouseoffcet x, y", x, y);
    console.log("mouseoffcet newX newY", newX, newY);

    if (!latestShip?.width || !latestShip?.height) {
      return;
    }

    ctx.clearRect(0, 0, 500, 500);
    ctx.fillStyle = "red";
    ctx.fillRect(newX, newY, latestShip.width, latestShip.height);
    latestShip.x = newX;
    latestShip.y = newY;
    console.log("%c New Rectangle Position:", "color: green", newX, newY);

    // Redraw all completed rectangles
    shipPositions.forEach((rect) => drawRectangle(ctx, rect));

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
