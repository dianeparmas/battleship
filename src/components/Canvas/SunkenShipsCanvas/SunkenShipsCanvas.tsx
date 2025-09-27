import { useEffect, useRef } from "react";

import { Ship } from "../../../types/battleship.types";
import { SunkenShipsCanvasProps } from "../../../types/SunkenShipsCanvas.types";

import { CANVAS_SIZE } from "../../../constants/canvasConstants";
import SVG_SYMBOL_IDS from "../../../constants/svgIds";

import styles from "./SunkenShipsCanvas.module.css";

const SunkenShipsCanvas = ({
  id,
  className = "",
  sunkenShips,
  imageCache,
}: SunkenShipsCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const symbolId = SVG_SYMBOL_IDS.SUNKEN_SHIP;
    const ctx = canvasRef?.current?.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.globalAlpha = 0.3;
    const shipImg = imageCache[symbolId];

    if (!shipImg) {
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
      sunkenShips.forEach((sunkenShip: Ship) => {
        const symbolId =
          sunkenShip.size > 3
            ? `sunken_ship_${sunkenShip.size}`
            : "sunken_ship";
        const shipImg = imageCache[symbolId];

        ctx.drawImage(
          shipImg,
          sunkenShip.x,
          sunkenShip.y,
          sunkenShip.width,
          sunkenShip.height,
        );
      });
    }, 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [sunkenShips]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      width={CANVAS_SIZE.WIDTH}
      height={CANVAS_SIZE.HEIGHT}
      className={styles[className]}
    />
  );
};

export default SunkenShipsCanvas;
