import { Marker } from "../types/StrikesCanvas.types";

import { animateStaticWaterExplosion } from "../animations/animations";

const drawExplosionMarkers = (markersParams) => {
  const {
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
  } = markersParams;
  markersRef.current.forEach((marker: Marker) => {
    if (!marker.isSplashFinished && marker.initialPulseLife > 0) {
      const pulseRatio = marker.initialPulseLife / marker.maxPulseLife;
      const pulseRadius =
        ((marker.maxPulseLife - marker.initialPulseLife) /
          marker.maxPulseLife) *
        Math.min(cellSize, cellSize) *
        0.9;
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${pulseRatio})`;
      ctx.lineWidth = 6 * pulseRatio;
      ctx.beginPath();
      // ctx.arc(marker.x, marker.y, pulseRadius, 0, Math.PI * 2);
      ctx.beginPath();
      ctx.ellipse(
        marker.x, // center X
        marker.y, // center Y
        pulseRadius * 1.2, // radiusX (make it wider)
        pulseRadius * 0.7, // radiusY (make it flatter)
        0, // rotation in radians
        0, // start angle
        Math.PI * 2, // end angle (full circle)
      );
      ctx.stroke();
      ctx.restore();
      marker.initialPulseLife--;
    }
    if (!marker.isSplashFinished) {
      marker.particles.forEach((p) =>
        p.update(
          marker.blastCeilingY,
          marker.blastFloorY,
          marker.blastMinX,
          marker.blastMaxX,
          cellSize,
        ),
      );
      marker.particles.forEach((p) => p.draw(ctx, marker.isHit));
      marker.particles = marker.particles.filter((p) => p.life > 0);

      if (marker.particles.length === 0 && marker.initialPulseLife <= 0) {
        console.log(
          "💥 Particle/Pulse animation finished. Transitioning to static marker.",
        );
        marker.isSplashFinished = true; // Transition to static phase
        const baseParams = {
          ctx,
          width: cellSize,
          height: cellSize,
          now,
          svgImageCache: imageCache,
        };
        console.log("-----------------------------static phase in HELPER");
        const explosionParams = {
          ...baseParams,
          x: isPlayerBoardStrikes
            ? latestCoords.x
            : latestStrike.currentHighLightCell.x,
          y: isPlayerBoardStrikes
            ? latestCoords.y
            : latestStrike.currentHighLightCell.y,
          key: !isPlayerBoardStrikes
            ? latestCoords
            : `${latestCoords.x},${latestCoords.y}`,
          missStartTimes,
          canvasSize: canvasSize,
          cellSize: cellSize,
          canvasRef,
          activeStrikesRef,
          imageCache
        };
        if (marker.isHit) {
          console.log("static phase HIT");
          fireStrikes.current.push({
            x: isPlayerBoardStrikes
              ? lastSplashCoordsRef.current.x
              : latestStrike.currentHighLightCell.x,
            y: isPlayerBoardStrikes
              ? lastSplashCoordsRef.current.y
              : latestStrike.currentHighLightCell.y,
          });
        } else {
          animateStaticWaterExplosion(explosionParams);
        }
      }
    } else {
      // --- 2. Static Phase (MISS Marker) ---
      // const baseParams = {
      //   ctx,
      //   width: GRID_CELL_SIZE,
      //   height: GRID_CELL_SIZE,
      //   now,
      //   svgImageCache: imageCache,
      // };
      // console.log("static phase");
      // const explosionParams = {
      //   ...baseParams,
      //   x: latestStrike.currentHighLightCell.x,
      //   y: latestStrike.currentHighLightCell.y,
      //   key: latestCoords,
      //   missStartTimes,
      // };
      // drawWaterExplosion(explosionParams);
      // animateStaticWaterExplosion(explosionParams);
    }
  });
};

export default drawExplosionMarkers;
