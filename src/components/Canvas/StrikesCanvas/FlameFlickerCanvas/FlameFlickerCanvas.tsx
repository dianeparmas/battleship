import { useEffect, useMemo, useRef } from "react";

import { useTheme } from "../../../../contexts/ThemeContext";

import { FlameFlickerCanvasProps } from "../../../../types/FlameFlickerCanvas.types";

import { GRID_CELL_SIZE } from "../../../../constants/canvasConstants";
import SVG_SYMBOL_IDS from "../../../../constants/svgIds";

import { gridCellToCoords } from "../../../../utils/canvasUtils";

import { drawFireFlicker } from "../../../../animations/animations";

import styles from "./FlameFlickerCanvas.module.css";

const FlameFlickerCanvas = ({
  className = "",
  opponentBoardHits = [],
  imageCache,
  fireStrikes,
  playerBoardHits = [],
}: FlameFlickerCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flamePhasesRef = useRef<Record<string, number>>({});
  const animationFrameRef = useRef<number | null>(null);

  const { canvasSize, cellSize } = useTheme();

  const hasPlayerStrikes = playerBoardHits.length > 0;
  const hasStrikes = hasPlayerStrikes || opponentBoardHits.length;

  const flamePhases = useMemo(() => {
    const assignPhase = (key: string) => {
      if (!flamePhasesRef.current[key]) {
        flamePhasesRef.current[key] = Math.random() * Math.PI * 2;
      }
    };

    if (hasPlayerStrikes) {
      playerBoardHits.forEach((hit) => {
        const coords = gridCellToCoords(hit);
        assignPhase(`${coords?.x},${coords?.y}`);
      });
    } else if (opponentBoardHits.length) {
      opponentBoardHits.forEach((strike) => {
        const key = `${strike.currentHighLightCell?.x},${strike.currentHighLightCell?.y}`;
        assignPhase(key);
      });
    }
    return flamePhasesRef.current;
  }, [opponentBoardHits, playerBoardHits]);

  useEffect(() => {
    let frameId: number;
    const ctx = canvasRef?.current?.getContext("2d");

    if (!ctx || !hasStrikes) {
      return;
    }

    const animate = () => {
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      const now = performance.now();

      const baseParams = {
        ctx,
        width: GRID_CELL_SIZE,
        height: GRID_CELL_SIZE,
        now,
        svgImageCache: imageCache,
      };

      if (fireStrikes.current?.length) {
        fireStrikes.current.forEach((marker) => {
          const key = `${marker.x},${marker.y}`;
          const flickerParams = {
            ...baseParams,
            symbolId: SVG_SYMBOL_IDS.FIRE,
            x: marker.x,
            y: marker.y,
            phaseKey: key,
            flamePhases,
          };
          drawFireFlicker(flickerParams);
        });
      }

      frameId = requestAnimationFrame(animate);
      animationFrameRef.current = frameId;
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    frameId = requestAnimationFrame(animate);
    animationFrameRef.current = frameId;

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [opponentBoardHits, playerBoardHits, flamePhases]);

  return (
    <canvas
      style={{ top: `${cellSize - 1}px`, left: `${cellSize - 1}px` }}
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className={styles[className]}
    />
  );
};

export default FlameFlickerCanvas;
