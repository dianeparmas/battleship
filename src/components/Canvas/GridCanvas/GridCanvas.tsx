import { useEffect, useRef } from "react";

import { useTheme } from "../../../contexts/ThemeContext";

import { GridCanvasProps } from "../../../types/GridCanvas.types";

import {
  CANVAS_SIZE,
  GRID_CELL_SIZE,
} from "../../../constants/canvasConstants";

import { drawCoordinates, drawGrid } from "../../../drawing/drawing";

import styles from "./GridCanvas.module.css";

const GridCanvas = ({ id, className = "", isGameTime }: GridCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { gridCanvasSize } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawCoordinates(ctx, gridCanvasSize);
        drawGrid(ctx, gridCanvasSize, "#000");
      }
    }
  }, [gridCanvasSize]);

  useEffect(() => {
    if (isGameTime) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return;
        }
        ctx.beginPath();
        // ctx.fillStyle = "rgba(130, 205, 255, 0.1)";

        // testing blue

        // const gradient = ctx.createLinearGradient(0, 0, 0, 0 + gridCanvasSize);
        
        // gradient.addColorStop(0, "#00aaff"); // Light blue at the top // Use colors similar to your futuristic bar (bright/deep blue)
        // gradient.addColorStop(0.5, "#0088cc"); // Core water color
        // gradient.addColorStop(1, "#005588"); // Dark blue at the bottom

        // ctx.fillStyle = gradient;

        // testing blue end

        // ctx.fillRect(
        //   GRID_CELL_SIZE,
        //   GRID_CELL_SIZE,
        //   CANVAS_SIZE.WIDTH_GRID,
        //   CANVAS_SIZE.HEIGHT_GRID,
        // );
        ctx.lineWidth = 2;
        ctx.stroke();
        drawGrid(ctx, gridCanvasSize, "rgba(34, 107, 233, 1)");
        // drawGrid(ctx, gridCanvasSize, "rgba(130, 205, 255, 1)");
      }
    }
  }, [isGameTime]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      width={gridCanvasSize}
      height={gridCanvasSize}
      className={`${styles[className]} ${styles.gridCanvas}`}
    />
  );
};

export default GridCanvas;
