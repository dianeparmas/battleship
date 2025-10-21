import { useEffect, useMemo, useRef } from "react";

import { useTheme } from "../../../contexts/ThemeContext";

import { CoordinatePoints } from "../../../types/battleship.types";
import { Marker, StrikesCanvasProps, SplashParams } from "../../../types/StrikesCanvas.types";

import SVG_SYMBOL_IDS from "../../../constants/svgIds";

import drawExplosionMarkers from "../../../helpers/drawExplosionMarkers";

import { gridCellToCoords } from "../../../utils/canvasUtils";

import { ExplosionParticle } from "../../../animations/ExplosionParticle";

import FlameFlickerCanvas from "./FlameFlickerCanvas/FlameFlickerCanvas";

import styles from "./StrikesCanvas.module.css";

const StrikesCanvas = ({
  id,
  className = "",
  isPlayerBoardStrikes = false,
  opponentBoardStrikes = [],
  playerBoardHits,
  playerBoardMisses,
  imageCache,
  latestAiMove,
}: StrikesCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const markerIdCounterRef = useRef(0);
  const lastSplashCoordsRef = useRef<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const activeStrikesRef = useRef<Record<string, number>[]>([]);
  const missStartTimes = useRef<Record<string, number>>({});
  const fireStrikes = useRef<CoordinatePoints[]>([]);

  const { canvasSize, cellSize } = useTheme();

  const latestStrike = useMemo(() => {
    if (isPlayerBoardStrikes) {
    }
    return opponentBoardStrikes[opponentBoardStrikes.length - 1];
  }, [opponentBoardStrikes]);

  const latestPlayerBoardHit = useMemo(() => {
    if (!isPlayerBoardStrikes || !playerBoardHits?.length) {
      return;
    }
    return {
      cell: playerBoardHits[playerBoardHits?.length - 1],
      isHit: true,
    };
  }, [playerBoardHits]);

  const latestPlayerBoardMiss = useMemo(() => {
    if (!isPlayerBoardStrikes) {
      return;
    }
    return playerBoardMisses[playerBoardMisses?.length - 1];
  }, [playerBoardMisses]);

  const hasPlayerBoardStrikes =
    isPlayerBoardStrikes &&
    (playerBoardHits?.length > 0 || playerBoardMisses?.length > 0);
  const hasStrikes =
    hasPlayerBoardStrikes ||
    (!isPlayerBoardStrikes && opponentBoardStrikes.length);

  const opponentBoardHits = opponentBoardStrikes.filter((strike) => strike.hit);

  const drawStaticExplosions = (ctx: CanvasRenderingContext2D) => {
    activeStrikesRef.current.forEach((element) => {
      ctx.drawImage(
        imageCache[SVG_SYMBOL_IDS.EXPLOSION],
        element.x,
        element.y,
        cellSize,
        cellSize,
      );
    });
  };

  const createSplash = (splashParams: SplashParams) => {
    const { x, y, isHit, latestCoords } = splashParams;
    console.log(
      "%c createSplash called at",
      "color: green;font-size: 16px;",
      `isHit: ${isHit}`,
      "latestCoords: ",
      latestCoords,
    );

    const PARTICLE_COUNT = 100;

    const MAX_BLAST_CELLS_HIGH = isHit ? 1.5 : 2;
    const MAX_BLAST_CELLS_DOWN = 0;
    const MAX_BLAST_CELLS_WIDE = 1;
    const initialPulseDuration = 15;
    // Calculate cell index of the impact point
    const currentCellXIndex = Math.floor(x / cellSize);
    const currentCellYIndex = Math.floor(y / cellSize);
    // Calculate X Boundaries (Left edge of X-1 cell to Right edge of X+1 cell)
    const minX = Math.max(
      0,
      (currentCellXIndex - MAX_BLAST_CELLS_WIDE) * cellSize,
    );
    const maxX = Math.min(
      canvasSize,
      (currentCellXIndex + MAX_BLAST_CELLS_WIDE + 1) * cellSize,
    );

    // Calculate Y Boundaries
    // Ceiling Y: Top edge of Y-2 cell
    // testing start -- with below we enforce ceiling
    // const ceilingY = Math.max(
    //   0,
    //   (currentCellYIndex - MAX_BLAST_CELLS_HIGH) * cellSize,
    // );
    const VIRTUAL_BLAST_CELL_INDEX = currentCellYIndex - MAX_BLAST_CELLS_HIGH;
    const ceilingY = VIRTUAL_BLAST_CELL_INDEX * cellSize;
    // testing end
    // Floor Y: Bottom edge of the clicked cell (Y+1 cell's top edge)
    const floorY = Math.min(
      canvasSize,
      (currentCellYIndex + MAX_BLAST_CELLS_DOWN + 1) * cellSize,
    );

    const newMarker: Marker = {
      id: markerIdCounterRef.current++,
      x: x,
      y: y,
      particles: [],
      isSplashFinished: false,
      initialPulseLife: initialPulseDuration,
      maxPulseLife: initialPulseDuration,
      blastCeilingY: ceilingY,
      blastFloorY: floorY, // Vertical containment boundary
      blastMinX: minX,
      blastMaxX: maxX,
      isHit: isHit,
    };

    if (isHit) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        newMarker.particles.push(new ExplosionParticle(x, y, isHit));
      }
    } else {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        newMarker.particles.push(new ExplosionParticle(x, y, isHit));
      }
    }
    markersRef.current.push(newMarker);
  };

  useEffect(() => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (
      isPlayerBoardStrikes &&
      (latestPlayerBoardHit || latestPlayerBoardMiss)
    ) {
      // Player canvas should only react to playerBoardStrikes, not opponentBoardStrikes
      if (!latestPlayerBoardMiss && !latestPlayerBoardHit) return;
    } else {
      // Opponent canvas should only react to opponentBoardStrikes
      if (!latestStrike) return;
    }

    if (!ctx || !hasStrikes) {
      console.log("%c RETURNING", "font-size: 30px; color: red");
      return;
    }
    const latestCoords = isPlayerBoardStrikes
      ? gridCellToCoords(
          latestPlayerBoardHit?.cell === latestAiMove
            ? latestPlayerBoardHit?.cell
            : latestPlayerBoardMiss,
        )
      : `${latestStrike?.currentHighLightCell?.x},${latestStrike?.currentHighLightCell?.y}`;
    const latestPlayerBoardHitCoords = gridCellToCoords(
      latestPlayerBoardHit?.cell || "",
    );

    if (lastSplashCoordsRef.current !== latestCoords) {
      const splashObj = {
        x:
          (isPlayerBoardStrikes
            ? latestCoords.x
            : latestStrike.currentHighLightCell.x) +
          cellSize / 2,
        y:
          (isPlayerBoardStrikes
            ? latestCoords.y
            : latestStrike.currentHighLightCell.y) +
          cellSize / 2,
        isHit: isPlayerBoardStrikes
          ? latestPlayerBoardHit?.cell === latestAiMove
            ? true
            : false
          : latestStrike.hit,
        latestCoords: isPlayerBoardStrikes
          ? latestCoords
          : latestStrike.currentHighLightCell,
      };
      createSplash(splashObj);
      lastSplashCoordsRef.current = latestCoords;
    }

    let cancelled = false;
    const animate = (now: number) => {
      if (cancelled) return;
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      drawStaticExplosions(ctx);
      if (!markersRef.current.length) return;
      const explosionMarkersObj = {
        markersRef,
        cellSize,
        ctx,
        now,
        imageCache,
        isPlayerBoardStrikes,
        latestCoords,
        latestStrike,
        missStartTimes,
        canvasSize,
        fireStrikes,
        lastSplashCoordsRef,
        canvasRef,
        activeStrikesRef,
      };
      drawExplosionMarkers(explosionMarkersObj);

      markersRef.current = markersRef.current.filter(
        (marker) => !marker.isSplashFinished,
      );

      if (markersRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    };

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
    };
  }, [latestStrike, latestPlayerBoardMiss, latestPlayerBoardHit]);

  return (
    <>
      <FlameFlickerCanvas
        imageCache={imageCache}
        className="flameFlickerCanvas"
        opponentBoardHits={opponentBoardHits}
        fireStrikes={fireStrikes}
        playerBoardHits={playerBoardHits}
      />
      <canvas
        style={{ top: `${cellSize - 1}px`, left: `${cellSize - 1}px` }}
        ref={canvasRef}
        id={id}
        width={canvasSize}
        height={canvasSize}
        className={styles[className]}
      />
    </>
  );
};

export default StrikesCanvas;
