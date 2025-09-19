import { useEffect, useRef } from "react";

import { GridCanvasProps } from "../../../types/GridCanvas.types";

import {
  CANVAS_SIZE,
  GRID_CELL_SIZE,
} from "../../../constants/canvasConstants";

import { drawCoordinates, drawGrid } from "../../../drawing/drawing";

import styles from "./GridCanvas.module.css";

const GridCanvas = ({
  id,
  className = "",
  startingPoint = 0,
  isGameTime,
}: GridCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawCoordinates(ctx);
        drawGrid(
          ctx,
          CANVAS_SIZE.WIDTH,
          CANVAS_SIZE.HEIGHT,
          "#000",
          startingPoint,
        );
      }
    }
  }, []);

  useEffect(() => {
    if (isGameTime) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return;
        }
        ctx.beginPath();
        ctx.fillStyle = "rgba(130, 205, 255, 0.1)";
        ctx.fillRect(
          GRID_CELL_SIZE,
          GRID_CELL_SIZE,
          CANVAS_SIZE.WIDTH,
          CANVAS_SIZE.HEIGHT,
        );
        ctx.lineWidth = 2;
        ctx.stroke();
        drawGrid(
          ctx,
          CANVAS_SIZE.WIDTH,
          CANVAS_SIZE.HEIGHT,
          "rgba(130, 205, 255, 1)",
          startingPoint,
        );
      }
    }
  }, [isGameTime]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      width={CANVAS_SIZE.WIDTH}
      height={CANVAS_SIZE.HEIGHT}
      className={`${styles[className]} ${styles.gridCanvas}`}
    />
  );
};

export default GridCanvas;
