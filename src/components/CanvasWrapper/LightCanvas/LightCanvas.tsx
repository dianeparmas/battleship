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

import styles from "./LightCanvas.module.css";

const LightCanvas = ({
  width = 500,
  height = 500,
  id,
  className = "",
  gridCellSize = 50,
  isHighlight = false,
  setShips,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const highlightCell = useRef<Ship>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    currentlyActive: false,
  });

  // const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
  //   const { x, y } = getMouseCoordinates(event, canvasRef);
  //   setLatestStartPoint({ x, y });
  //   setLatestEndPoint({ x, y });
  //   setIsDrawing(true);

  //   if (isCursorOverShip) {
  //     setIsDrawing(false);
  //     setIsDragging(true);

  //     // set mouse offset from the rectangle's top-left corner
  //     const { mouseOffsetX, mouseOffsetY } = getMouseOffsetCoordinates(
  //       event,
  //       [],
  //       canvasRef,
  //     );
  //     mouseOffsetRef.current = { x: mouseOffsetX, y: mouseOffsetY };
  //   }
  // };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef?.current?.getContext("2d");
    console.log('mouesemove');
    const { x, y } = getMouseCoordinates(event, canvasRef);
    if (ctx) {
      const activeColumn = Math.floor(x / gridCellSize) + 1;
      const activeRow = Math.floor(y / gridCellSize) + 1;
      // console.log('activeColumn:', Math.floor(x / 50) + 1, 'activeRow: ', Math.floor(y / 50) + 1);

      if (x > 0) {
        highlightCell.current = {
          y: activeRow * gridCellSize - gridCellSize,
          x: activeColumn * gridCellSize - gridCellSize,
          width: gridCellSize,
          height: gridCellSize,
        };
        drawRectangle(ctx, highlightCell.current, true, true);
        // console.log(highlightCell.current);
      }
    }
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
        // onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        // onMouseUp={handleMouseUp}
      />
      <p></p>
    </>
  );
};

export default LightCanvas;
