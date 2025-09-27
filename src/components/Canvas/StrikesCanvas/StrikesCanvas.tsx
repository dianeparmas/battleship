import { useEffect, useMemo, useRef } from "react";

import {
  CANVAS_SIZE,
  GRID_CELL_SIZE,
} from "../../../constants/canvasConstants";

import { gridCellToCoords } from "../../../utils/canvasUtils";

import { StrikesCanvasProps } from "../../../types/StrikesCanvas.types";

import {
  drawFireFlicker,
  drawWaterExplosion,
} from "../../../animations/animations";

import { initialGameState } from "../../../reducers/gameReducer";

import styles from "./StrikesCanvas.module.css";

const StrikesCanvas = ({
  id,
  className = "",
  isPlayerStrikes = false,
  opponentBoardStrikes = [],
  playerBoardStrikes = initialGameState.ai,
  imageCache,
}: StrikesCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flamePhasesRef = useRef<Record<string, number>>({});

  const hasPlayerStrikes =
    isPlayerStrikes &&
    (playerBoardStrikes.hits.length > 0 ||
      playerBoardStrikes.misses.length > 0);

  const hasStrikes =
    hasPlayerStrikes || (!isPlayerStrikes && opponentBoardStrikes.length);

  const flamePhases = useMemo(() => {
    const assignPhase = (key: string) => {
      if (!flamePhasesRef.current[key]) {
        flamePhasesRef.current[key] = Math.random() * Math.PI * 2;
      }
    };

    if (hasPlayerStrikes) {
      playerBoardStrikes.hits?.forEach(assignPhase);
      playerBoardStrikes.misses?.forEach(assignPhase);
    } else if (!isPlayerStrikes && opponentBoardStrikes.length) {
      opponentBoardStrikes.forEach((strike) => {
        const key = `${strike.currentHighLightCell?.x},${strike.currentHighLightCell?.y}`;
        if (!flamePhasesRef.current[key]) {
          flamePhasesRef.current[key] = Math.random() * Math.PI * 2;
        }
      });
    }
    return flamePhasesRef.current;
  }, [opponentBoardStrikes, playerBoardStrikes]);

  const missStartTimes = useRef<Record<string, number>>({});

  useEffect(() => {
    let animationFrame: number;
    const ctx = canvasRef?.current?.getContext("2d");

    if (!ctx || !hasStrikes) return;

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
      const now = performance.now();

      const baseParams = {
        ctx,
        width: GRID_CELL_SIZE,
        height: GRID_CELL_SIZE,
        now,
        svgImageCache: imageCache,
      };

      if (isPlayerStrikes) {
        const hits = playerBoardStrikes.hits;
        const misses = playerBoardStrikes.misses;
        hits.forEach((hit) => {
          const coords = gridCellToCoords(hit);
          const flickerParams = {
            ...baseParams,
            symbolId: "fire",
            x: coords.x,
            y: coords.y,
            phaseKey: hit,
            flamePhases,
          };
          drawFireFlicker(flickerParams);
        });
        misses.forEach((miss) => {
          const coords = gridCellToCoords(miss);
          const explosionParams = {
            ...baseParams,
            x: coords.x,
            y: coords.y,
            key: miss,
            missStartTimes,
          };
          drawWaterExplosion(explosionParams);
        });
      } else {
        opponentBoardStrikes.forEach((strike) => {
          const { currentHighLightCell, hit } = strike;
          const key =
            currentHighLightCell?.cell ||
            `${currentHighLightCell?.x},${currentHighLightCell?.y}`;
          if (hit) {
            const flickerParams = {
              ...baseParams,
              symbolId: "fire",
              x: currentHighLightCell.x,
              y: currentHighLightCell.y,
              phaseKey: key,
              flamePhases,
            };
            drawFireFlicker(flickerParams);
          } else {
            const explosionParams = {
              ...baseParams,
              x: currentHighLightCell.x,
              y: currentHighLightCell.y,
              key,
              missStartTimes,
            };
            drawWaterExplosion(explosionParams);
          }
        });
      }

      animationFrame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [opponentBoardStrikes, playerBoardStrikes, isPlayerStrikes, flamePhases]);

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

export default StrikesCanvas;
