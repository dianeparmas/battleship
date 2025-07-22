import { useEffect, useRef } from "react";

import { CanvasProps } from "../../../types/battleship.types";

import styles from "./GridCanvas.module.css";

const GridCanvas = ({
  width = 500,
  height = 500,
  id,
  className = "",
  gridCellSize = 50,
  startingPoint = 0,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    console.log("useeffect GridCanvas empty dependency array");
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawGrid(ctx, width, height);
        drawCoordinates(ctx);
      }
    }
  }, []);

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ) => {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    for (let x = startingPoint; x <= canvasWidth; x += gridCellSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
    }
    for (let y = startingPoint; y <= canvasHeight; y += gridCellSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
    }
    ctx.stroke();
  };

  const drawNumbers = (ctx: CanvasRenderingContext2D) => {
    for (let i = 0; i < 10; i++) {
      const spacing = 90;
      const x = 25;
      const y = i === 0 ? spacing : i * 50 + spacing;
      ctx.font = "45px serif";
      ctx.textAlign = "center";
      ctx.fillText(`${i + 1}`, x, y);
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
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(600, 0);
    ctx.closePath();

    ctx.moveTo(0, 50);
    ctx.lineTo(0, 600);
    ctx.closePath();

    ctx.lineWidth = 5;

    ctx.stroke();

    drawNumbers(ctx);
    drawLetters(ctx);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        id={id}
        width={width}
        height={height}
        className={`${styles[className]} ${styles.gridCanvas}`}
      />
      <p></p>
    </>
  );
};

export default GridCanvas;
