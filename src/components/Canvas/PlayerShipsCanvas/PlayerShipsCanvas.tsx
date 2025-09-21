import { useEffect, useMemo, useRef } from "react";

import { PlayerShipsCanvasProps } from "../../../types/PlayerShipsCanvas.types";

import { ShipSize } from "../../../types/battleship.types";

import { CANVAS_SIZE } from "../../../constants/canvasConstants";
import SHIP_IMAGES from "../../../constants/shipImages";

import { drawFloatingShips } from "../../../animations/animations";
import { drawSvgSymbolOnCanvas } from "../../../drawing/drawing";

import iconsUrl from "../../../assets/icons.svg";

import styles from "./PlayerShipsCanvas.module.css";

const PlayerShipsCanvas = ({
  id,
  className = "",
  playerShips,
}: PlayerShipsCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({}); // Cache for loaded images

  // Assign a random phase to each ship for independent rocking
  const shipPhases = useMemo(
    () =>
      playerShips.reduce(
        (acc, ship) => {
          acc[`${ship.x},${ship.y},${ship.size}`] = Math.random() * Math.PI * 2;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [playerShips],
  );

  useEffect(() => {
    playerShips.forEach((ship) => {
      const symbolId = ship.isHorizontal
        ? SHIP_IMAGES[ship.size as ShipSize]
        : "vertical_" + SHIP_IMAGES[ship.size as ShipSize];

      if (!symbolId || imageCache.current[symbolId]) {
        return;
      }
      const ctx = canvasRef?.current?.getContext("2d");
      if (!ctx) {
        return;
      }
      const svgDrawParams = {
        ctx,
        symbolId,
        spriteUrl: iconsUrl,
        drawShip: true,
        imageCache,
      };
      drawSvgSymbolOnCanvas(svgDrawParams);
    });
  }, [playerShips]);

  useEffect(() => {
    let animationFrame: number;

    function animate() {
      const ctx = canvasRef?.current?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
        const now = performance.now() / 1000; // seconds

        playerShips.forEach((ship) => {
          const floatingShipsParams = {
            ctx,
            ship,
            shipPhases,
            now,
            imageCache,
          };
          drawFloatingShips(floatingShipsParams);
        });
      }
      animationFrame = requestAnimationFrame(animate);
    }

    animate();
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [playerShips, shipPhases]);

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

export default PlayerShipsCanvas;
