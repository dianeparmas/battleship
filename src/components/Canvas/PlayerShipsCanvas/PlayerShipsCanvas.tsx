import { useEffect, useMemo, useRef, useState } from "react";

import { Ship } from "../../../types/battleship.types";
import { PlayerShipsCanvasProps } from "../../../types/PlayerShipsCanvas.types";

import { ShipSize } from "../../../types/battleship.types";

import { CANVAS_SIZE } from "../../../constants/canvasConstants";
import SHIP_IMAGES from "../../../constants/shipImages";

import {
  drawFloatingShips,
  drawSinkingShip,
} from "../../../animations/animations";
import { drawSvgSymbolOnCanvas } from "../../../drawing/drawing";

import { preloadSvgSymbol, getShipSVGId } from "../../../utils/canvasUtils";

import iconsUrl from "../../../assets/icons.svg";

import styles from "./PlayerShipsCanvas.module.css";

const svgImageCache: Record<string, HTMLImageElement> = {};

const PlayerShipsCanvas = ({
  id,
  className = "",
  playerShips,
  gameState,
  dispatch,
}: PlayerShipsCanvasProps) => {
  const [sunkenShip, setSunkenShip] = useState(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({}); // Cache for loaded images
  const isMounted = useRef(false);
  const shipPhasesRef = useRef<Record<string, number> | null>(null);

  if (shipPhasesRef.current === null) {
    console.log("initializing shipPhases");
    shipPhasesRef.current = playerShips.reduce(
      (acc, ship) => {
        acc[`${ship.x},${ship.y},${ship.size}`] = Math.random() * Math.PI * 2;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
  const shipPhases = shipPhasesRef.current;

  // Assign a random phase to each ship for independent rocking
  // const shipPhases = useMemo(
  //   () =>
  //     playerShips.reduce(
  //       (acc, ship) => {
  //         acc[`${ship.x},${ship.y},${ship.size}`] = Math.random() * Math.PI * 2;
  //         return acc;
  //       },
  //       {} as Record<string, number>,
  //     ),
  //   [playerShips],
  // );

  const drawPlayerShips = (ships: Ship[]) => {
    ships.forEach((ship: Ship) => {
      const symbolId = getShipSVGId(ship);

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
  };

  useEffect(() => {
    drawPlayerShips(playerShips);
  }, [playerShips]);

  useEffect(() => {
    if (sunkenShip) {
      console.log("sunkenship useeffect run animation");
      animateSunkenShip(sunkenShip);
    }
  }, [sunkenShip]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      // get the horizontal ship IDs
      const horizontalShipIds = Object.values(SHIP_IMAGES);
      // create the vertical ship IDs
      const verticalShipIds = horizontalShipIds.map((id) => `vertical_${id}`);
      // combine
      const allShipIds = [...horizontalShipIds, ...verticalShipIds];
      // iterate and preload all images
      allShipIds.forEach((symbolId) => {
        preloadSvgSymbol(symbolId, iconsUrl, (img) => {
          svgImageCache[symbolId] = img;
        });
      });
    }
  }, []);

  const handleAiTurn = (result: "hit" | "miss", cell: string) => {
    console.log("handleAiTurn fn", result);
    dispatch({ type: "AI_TURN", result, cell });
  };

  useEffect(() => {
    if (gameState.ai.hits.length) {
      console.log("i run if ai hits array chnages");
      handleAiTurn("hit", gameState.ai.latestMove);
    }
  }, [gameState.ai.hits]);

  useEffect(() => {
    if (gameState.ai.misses.length) {
      console.log("i run if ai misses array chnages");
      handleAiTurn("miss", gameState.ai.latestMove);
    }
  }, [gameState.ai.misses]);

  useEffect(() => {
    const newlyDestroyed = playerShips.find(
      (ship) => ship.isDestroyed && !ship._wasAnimated,
    );

    if (newlyDestroyed) {
      setSunkenShip({ ...newlyDestroyed, animationStartTime: Date.now() });
      // mark it so we don’t re-trigger
      newlyDestroyed._wasAnimated = true;
    }
  }, [playerShips]);

  const animateSunkenShip = (shipToAnimate) => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (!ctx || !shipToAnimate) return;

    const now = Date.now();
    const timeElapsed = now - shipToAnimate.animationStartTime;
    const duration = 1000;
    const progress = Math.min(timeElapsed / duration, 1);
    const symbolId = getShipSVGId(shipToAnimate);
    const shipImg = imageCache.current[symbolId];

    const sinkingShipParams = {
      ctx,
      shipToAnimate,
      imageCache,
      progress,
      shipImg,
    };

    drawSinkingShip(sinkingShipParams);

    ctx.restore();
    if (progress < 1) {
      requestAnimationFrame(() => animateSunkenShip(shipToAnimate));
    } else {
      setSunkenShip(null);
    }
  };

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
