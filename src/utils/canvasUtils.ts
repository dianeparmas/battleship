import React from "react";

import { Ship, ImgObj, StrikeObj } from "../types/battleship.types";

export const drawRectangle = (
  ctx: CanvasRenderingContext2D,
  rect: Ship,
  isHighlight?: boolean,
  isOpponentBoard?: boolean,
  mockOpponentBoard?: Ship[],
) => {
  if (isHighlight) {
    ctx.clearRect(rect.x, rect.y, 500, 500);
  }
  if (isOpponentBoard) {
    ctx.clearRect(0, 0, 500, 500);
    mockOpponentBoard?.forEach((rect) => drawRectangle(ctx, rect));
  }
  ctx.beginPath();
  ctx.fillStyle = isHighlight ? "rgba(247, 234, 136, 0.4)" : "purple";
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  // console.log("drawing: ", rect.x, rect.y, rect.width, rect.height);
  ctx.lineWidth = 2;
  ctx.stroke();
  // console.log('drawRectangle fn');
};

export const drawStrike = (
  ctx: CanvasRenderingContext2D,
  strikeObj: StrikeObj,
) => {
  const { currentHighLightCell, hit } = strikeObj;
  const image = new Image();
  image.onload = function () {
    ctx.drawImage(
      image,
      currentHighLightCell.x,
      currentHighLightCell.y,
      50,
      50,
    );
  };
  if (hit) {
    image.src = "fire.svg";
  } else {
    image.src = "explosion.svg";
  }
};

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
  // const latestShip: Ship = shipPositions[shipPositions.length - 1] || {}; // incorrect
  const targetShip = shipPositions.find(
    (ship) =>
      ship.x === currentlyActiveShip.current.x &&
      ship.y === currentlyActiveShip.current.y,
  );

  return {
    // mouseOffsetX: x - latestShip.x,
    // mouseOffsetY: y - latestShip.y,
    mouseOffsetX: x - targetShip.x,
    mouseOffsetY: y - targetShip.y,
  };
};

export const roundToNearest = (num: number) => Math.round(num / 50) * 50;
