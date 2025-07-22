import { useEffect, useRef } from "react";

import { drawStrike } from "../../../utils/canvasUtils";

import { CanvasProps } from "../../../types/battleship.types";

import styles from "./OpponentBoardStrikesCanvas.module.css";

const OpponentBoardStrikesCanvas = ({
  width = 500,
  height = 500,
  id,
  className = "",
  strikedSquares,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (ctx && strikedSquares) {
      strikedSquares.forEach((strike) => drawStrike(ctx, strike));
    }
  }, [strikedSquares]);

  return (
    <>
      <canvas
        ref={canvasRef}
        id={id}
        width={width}
        height={height}
        className={styles[className]}
        // onMouseDown={handleMouseDown}
        // onMouseMove={handleMouseMove}
        // onMouseUp={handleMouseUp}
      />
      <p></p>
    </>
  );
};

export default OpponentBoardStrikesCanvas;
