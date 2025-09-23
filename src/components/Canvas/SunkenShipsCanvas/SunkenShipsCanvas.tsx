import { useEffect, useRef } from "react";

import { Ship } from "../../../types/battleship.types";
import { SunkenShipsCanvasProps } from "../../../types/SunkenShipsCanvas.types";

import { CANVAS_SIZE } from "../../../constants/canvasConstants";

import { preloadSvgSymbol } from "../../../utils/canvasUtils";

import iconsUrl from "../../../assets/icons.svg";

import styles from "./SunkenShipsCanvas.module.css";

const svgImageCache: Record<string, HTMLImageElement> = {};

const SunkenShipsCanvas = ({
  id,
  className = "",
  sunkenShips,
}: SunkenShipsCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const symbolId = "sunken_ship";
    preloadSvgSymbol(symbolId, iconsUrl, (img) => {
      svgImageCache[symbolId] = img;
    });
  }, []);

  useEffect(() => {
    const symbolId = "sunken_ship";
    const ctx = canvasRef?.current?.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.globalAlpha = 0.3;
    const shipImg = svgImageCache[symbolId];

    if (!shipImg) {
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
      sunkenShips.forEach((sunkenShip: Ship) => {
        ctx.drawImage(
          shipImg,
          sunkenShip.x,
          sunkenShip.y,
          sunkenShip.width,
          sunkenShip.height,
        );
      });
    }, 1000);

    //size 2/3 on ok
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
