import {
  FireFlickerParams,
  FloatingParams,
  SinkingShipParams,
  WaterExplosionParams,
  WavesParams,
} from "../types/animations.types";

import { getShipSVGId } from "../utils/svgUtils";

// Helper for animated water explosion (miss)
export const drawWaterExplosion = (explosionParams: WaterExplosionParams) => {
  const { ctx, x, y, width, height, key, now, svgImageCache, missStartTimes } =
    explosionParams;

  if (!ctx) {
    return;
  }

  const img = svgImageCache["explosion"];
  const MISS_ANIMATION_DURATION = 700; // ms
  if (!img) return;

  // Set animation start time if not set
  if (!missStartTimes.current[key]) {
    missStartTimes.current[key] = now;
  }
  const elapsed = now - missStartTimes.current[key];
  const progress = Math.min(elapsed / MISS_ANIMATION_DURATION, 1);

  //
  // Bounce scale: starts at 0.2, goes up to 1.3, then settles at 1
  // Formula: scale = 0.2 + 1.1 * sin(progress * PI)  (peaks at progress=0.5)
  let scale = 0.2 + 1.1 * Math.sin(progress * Math.PI);
  scale = Math.max(0.2, Math.min(scale, 1.3)); // Clamp to at least 0.2 and at most 1.3
  if (progress === 1) {
    scale = 1;
  } // After animation, keep at 1
  // const opacity = progress < 1 ? progress : 1; // Opacity: fade in with progress, then stay at 1
  //

  // Animate: scale from 0.2 to 1, opacity from 0 to 1
  // const scale = 0.2 + 0.8 * progress;
  ctx.save();
  ctx.globalAlpha = progress;
  ctx.drawImage(
    img,
    x + (width * (1 - scale)) / 2,
    y + (height * (1 - scale)) / 2,
    width * scale,
    height * scale,
  );
  ctx.restore();
};

// Helper for animated water explosion (hit)
export const drawFireFlicker = (flickerParams: FireFlickerParams) => {
  // kui player boardil on tuli, siis iga kord kui player klikib AI boardile siis player boardi fire nagu resetib; ai tuli on nagu ok - pole vahet kas playeril tulebhit või miss
  const {
    ctx,
    symbolId,
    x,
    y,
    width,
    height,
    phaseKey,
    svgImageCache,
    flamePhases,
  } = flickerParams;

  // console.log('drawing fire at x y :', x, y);

  if (!ctx) {
    return;
  }

  const img = svgImageCache[symbolId];
  if (!img) {
    return;
  }

  const now = performance.now();
  const phase = flamePhases[phaseKey] || 0;
  // Use the same values as WavesCanvas, but add phase for offset

  //normal
  const flicker = 0.15 * Math.sin(now / 600 + phase) + 0.85;

  //dramatic for TESTING if in sync
  // const flicker = 0.5 * Math.sin(now / 100 + phase) + 0.5; // alpha 0–1

  ctx.save();
  ctx.globalAlpha = flicker;
  const scale = 1 + 0.04 * Math.sin(now / 500 + phase + 2);
  ctx.drawImage(
    img,
    x + (width * (1 - scale)) / 2,
    y + (height * (1 - scale)) / 2,
    width * scale,
    height * scale,
  );
  ctx.restore();
};

export const drawWaves = ({ ctx, ship, speed }: WavesParams) => {
  if (!ctx) {
    return;
  }
  ctx.save();
  // ctx.strokeStyle = "rgba(173, 216, 230, 0.8)";
  ctx.strokeStyle = "rgba(150, 196, 248, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ship.isHorizontal) {
    for (let x = ship.x; x <= ship.x + ship.width; x += 4) {
      // ship.y (Top of ship cell) + ship.height (Bottom of ship cell) + 5 (Padding)
      const y =
        ship.y +
        ship.height +
        4 +
        Math.sin(x / ship.wave.length + speed + ship.wave.phase) *
          ship.wave.height;
      ctx.lineTo(x, y);
    }
  } else {
    // vertical ships (waves on both sides)
    // RIGHT side ---
    ctx.beginPath(); // Start a new path for the right wave
    for (let y = ship.y; y <= ship.y + ship.height; y += 4) {
      const x =
        ship.x +
        ship.width +
        0 + // Offset to the right of the ship
        Math.sin(y / ship.wave.length + speed + ship.wave.phase) *
          ship.wave.height;
      ctx.lineTo(x, y);
    }
    ctx.stroke(); // Draw the right wave

    // LEFT side ---
    ctx.beginPath(); // Start another new path for the left wave

    // Math.PI to the sine function's input to create an opposite wave pattern
    const leftWavePhase = ship.wave.phase + Math.PI;
    for (let y = ship.y; y <= ship.y + ship.height; y += 4) {
      const x =
        ship.x -
        0 + // Offset to the left of the ship (negative offset)
        Math.sin(y / ship.wave.length + speed + leftWavePhase) *
          ship.wave.height;
      ctx.lineTo(x, y);
    }
    ctx.stroke(); // Draw the left wave
  }

  ctx.stroke();
  ctx.restore();
};

export const drawFloatingShips = (floatingParams: FloatingParams) => {
  const { ctx, ship, shipPhases, now, imageCache } = floatingParams;
  if (!ctx) {
    return;
  }

  const phaseKey = `${ship.x},${ship.y},${ship.size}`;
  const phase = shipPhases[phaseKey] || 0;
  const amplitude = 2;
  const speed = 1.5;
  const yOffset = Math.sin(now * speed + phase) * amplitude;

  if (Object.keys(imageCache).length) {
    const symbolId = getShipSVGId(ship);
    const img = imageCache[symbolId];
    ctx.drawImage(img, ship.x, ship.y + yOffset, ship.width, ship.height);
  } else {
    ctx.beginPath();
    ctx.fillStyle = "purple";
    ctx.fillRect(ship.x, ship.y + yOffset, ship.width, ship.height);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};

export const drawSinkingShip = (sinkingParams: SinkingShipParams) => {
  const { ctx, shipToAnimate, progress, shipImg } = sinkingParams;
  if (!ctx) {
    return;
  }

  if (!shipImg) {
    // If the image is not ready, try again on the next frame
    // requestAnimationFrame(() => animateSunkenShip(shipToAnimate));
    return;
  }
  const opacity = 1 - progress;
  // const maxSink = shipToAnimate.isHorizontal
  //   ? shipToAnimate.height * 0.4
  //   : 50 * 0.4;
  // const yOffset = progress * maxSink;

  const padding = 20; // extra space for tilt + offset
  ctx.clearRect(
    shipToAnimate.x - padding,
    shipToAnimate.y - padding,
    shipToAnimate.width + padding * 2,
    shipToAnimate.height + padding * 2,
  );
  // Amount of sinking
  const maxSink = shipToAnimate.isHorizontal
    ? shipToAnimate.height * 0.4 // sink downward for horizontal
    : shipToAnimate.width * 0.3; // sink sideways for vertical

  // Offsets
  const xOffset = shipToAnimate.isHorizontal ? 0 : progress * maxSink;
  const yOffset = shipToAnimate.isHorizontal ? progress * maxSink : 0;
  // Center of the ship for rotation
  const centerX = shipToAnimate.x + shipToAnimate.width / 2;
  const centerY = shipToAnimate.y + shipToAnimate.height / 2;
  // AI TEST

  ctx.save();
  ctx.globalAlpha = opacity;

  // Center of the ship for rotation
  // const centerX = shipToAnimate.x + shipToAnimate.width / 2;
  // const centerY = shipToAnimate.y + shipToAnimate.height / 2;

  ctx.translate(centerX, centerY);
  // const maxTilt = Math.PI / 12;
  // ctx.rotate(progress * maxTilt);

  // ai
  // Tilt depending on orientation
  const maxTilt = Math.PI / 12;
  const tilt = progress * maxTilt * (shipToAnimate.isHorizontal ? 1 : -0.3);
  ctx.rotate(tilt);

  ctx.drawImage(
    shipImg,
    -shipToAnimate.width / 2 + xOffset,
    -shipToAnimate.height / 2 + yOffset,
    shipToAnimate.width,
    shipToAnimate.height,
  );
};
