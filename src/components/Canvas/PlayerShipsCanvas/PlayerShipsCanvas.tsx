import { useEffect, useRef, useState } from "react";

import { Ship } from "../../../types/battleship.types";
import { PlayerShipsCanvasProps } from "../../../types/PlayerShipsCanvas.types";

import { CANVAS_SIZE } from "../../../constants/canvasConstants";

import {
  drawFloatingShips,
  drawSinkingShip,
} from "../../../animations/animations";

import { getShipSVGId } from "../../../utils/canvasUtils";

import RemainingShips from "../../RemainingShips/RemainingShips";

import styles from "./PlayerShipsCanvas.module.css";

const PlayerShipsCanvas = ({
  id,
  className = "",
  playerShips,
  gameState,
  dispatch,
  imageCache,
}: PlayerShipsCanvasProps) => {
  const [sunkenShip, setSunkenShip] = useState(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shipPhasesRef = useRef<Record<string, number> | null>(null);

  const remainingPlayerShips = Math.abs(
    gameState.player.ships.length - gameState.player.destroyedShips.length,
  );

  if (shipPhasesRef.current === null) {
    shipPhasesRef.current = playerShips.reduce(
      (acc, ship) => {
        acc[`${ship.x},${ship.y},${ship.size}`] = Math.random() * Math.PI * 2;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
  const shipPhases = shipPhasesRef.current;

  useEffect(() => {
    if (sunkenShip) {
      console.log("sunkenship useeffect run animation");
      animateSunkenShip(sunkenShip);
    }
  }, [sunkenShip]);

  const handleAiTurn = (result: "hit" | "miss", cell: string) => {
    dispatch({ type: "AI_TURN", result, cell });
  };

  useEffect(() => {
    if (gameState.ai.hits.length) {
      handleAiTurn("hit", gameState.ai.latestMove);
    }
  }, [gameState.ai.hits]);

  useEffect(() => {
    if (gameState.ai.misses.length) {
      handleAiTurn("miss", gameState.ai.latestMove);
    }
  }, [gameState.ai.misses]);

  useEffect(() => {
    const newlyDestroyed = playerShips.find(
      (ship) => ship.isDestroyed && !ship._wasAnimated,
    );

    if (newlyDestroyed) {
      setSunkenShip({ ...newlyDestroyed, animationStartTime: Date.now() });
      dispatch({
        type: "SET_PLAYER_DESTROYED_SHIPS",
        destroyedShip: newlyDestroyed,
      });
      // mark it so we don’t re-trigger
      newlyDestroyed._wasAnimated = true;
    }
  }, [playerShips]);

  const animateSunkenShip = (shipToAnimate: Ship) => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (!ctx || !shipToAnimate) return;

    const now = Date.now();
    const timeElapsed = now - (shipToAnimate.animationStartTime ?? 0);
    const duration = 1000;
    const progress = Math.min(timeElapsed / duration, 1);
    const symbolId = getShipSVGId(shipToAnimate);
    const shipImg = imageCache[symbolId];

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
          if (ship.isDestroyed) {
            return;
          }
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
    <>
      <span className={styles.remainingPlayerShips}>
        <RemainingShips remainingShips={remainingPlayerShips} />
      </span>
      <canvas
        ref={canvasRef}
        id={id}
        width={CANVAS_SIZE.WIDTH}
        height={CANVAS_SIZE.HEIGHT}
        className={styles[className]}
      />
    </>
  );
};

export default PlayerShipsCanvas;
