// --- Configuration (High Power, Smooth Peak, Tighter Containment) ---
const PARTICLE_LIFESPAN = 210; // Life duration (Increased from 150 for slower fade)
// const GRAVITY = 0.05; // Reduced from 0.08 for much slower fall

const GRAVITY = 0.03; // Reduced from 0.08 for much slower fall
const PARTICLE_BASE_RADIUS = 3;

export class ExplosionParticle {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
  vx: number;
  vy: number;
  isHit: boolean;
  hasBounced: boolean;

  constructor(x: number, y: number, isHit: boolean) {
    this.x = x;
    this.y = y;
    this.isHit = isHit;
    this.hasBounced = false; // Initialize bounce flag

    // High thrust for torpedo effect, slightly reduced for slower start
    const speed = Math.random() * 3 + 1.5;

    // Horizontal velocity is small and random, but spreads wider than previous version
    this.vx = (Math.random() - 0.5) * 2; // horizontal spread
    // Vertical velocity is highly negative (upward)
    const thrustModifier = isHit ? 4.5 : 2.5
    this.vy = -Math.random() * speed - thrustModifier; // MODIFIED: Base thrust reduced from -5 to -4.5
    // to complement the lower ceiling
    this.radius = Math.random() * PARTICLE_BASE_RADIUS + 2;
    this.life = PARTICLE_LIFESPAN;
    this.maxLife = PARTICLE_LIFESPAN;

    // tesing color
    if (!isHit) {
      this.color = `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`;
    } else {
      // --- FIRE COLOR ADJUSTMENT ---
      // Choose a random color between red, orange, and yellow (using HSL for easy shifting)
      const hue = Math.floor(Math.random() * 60); // 0 (Red) to 60 (Yellow)
      const saturation = Math.floor(Math.random() * 30) + 70; // 70% to 100% saturation
      const lightness = Math.floor(Math.random() * 20) + 50; // 50% to 70% lightness
      this.color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      // --- END FIRE COLOR ADJUSTMENT ---
    }
  }

  /**
   * Updates particle position, applies physics, and enforces boundary limits.
   * @param {number} ceilingY - The maximum allowed Y coordinate (top boundary).
   * @param {number} floorY - The minimum allowed Y coordinate (bottom boundary).
   * @param {number} minX - The minimum allowed X coordinate (left boundary).
   * @param {number} maxX - The maximum allowed X coordinate (right boundary).
   */
  update(
    ceilingY: number,
    floorY: number,
    minX: number,
    maxX: number,
    cellSize: number,
  ) {
    // Apply physics
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    // --- 1. Vertical Constraint (Height Limit - REFINED Soft Ceiling) ---

    // Define the deceleration zone (Starts 1 cellHeight below the hard ceiling)
    const dragZoneY = ceilingY + cellSize;

    // Apply smooth drag only if moving UP (vy < 0) and is within the drag zone
    if (this.vy < 0 && this.y < dragZoneY) {
      // distanceFactor is 0 at dragZoneY and 1 at ceilingY.
      const distanceFactor = (dragZoneY - this.y) / cellSize;

      // Gradually reduce upward velocity dramatically as it reaches the peak
      this.vy *= Math.max(0.6, 1 - 0.7 * distanceFactor);
    }

    // Hard Clamp: If the particle actually passes the defined ceiling, stop it and kill velocity.
    if (this.y < ceilingY) {
      this.y = ceilingY;
      this.vy = 0.5; // Give a slight positive velocity to help gravity pull it down immediately
      this.vx *= 0.9; // Horizontal spread upon reaching peak
    }

    // --- 2. Vertical Constraint (Floor Limit) ---
    if (this.y > floorY) {
      if (!this.isHit && !this.hasBounced) {
        // *** WATER BOUNCE LOGIC (Only for misses) ***
        // Invert and dampen the velocity for the first bounce
        this.vy *= -0.4; // A noticeable bounce (e.g., 40% rebound)
        this.vx *= 0.6; // Reduce horizontal speed more drastically on bounce
        this.hasBounced = true; // Prevent future bounces
      } else {
        // *** HIT/FIRE or SECONDARY DAMPENING (Fire settles, Water stops after bounce) ***
        // Very heavy dampening to simulate settling or loss of energy
        this.vy *= -0.05; // Minimal bounce/settle
        this.vx *= 0.7; // Increased horizontal drag on settling
      }

      //   this.y = floorY; // Clamp position to the floor
      //   this.vy *= -0.15; // Moderate dampening: Minimal, heavy-looking bounce
      //   this.vx *= 0.7; // Increased horizontal drag on settling
    }

    // --- 3. Horizontal Constraint (Width Limit) ---
    if (this.x < minX) {
      this.x = minX;
      this.vx *= -0.3; // Gentle horizontal bounce
    } else if (this.x > maxX) {
      this.x = maxX;
      this.vx *= -0.3; // Gentle horizontal bounce
    }

    // Simple air resistance (friction)
    this.vx *= 0.97;
    this.vy *= 0.99;

    this.life--;
  }

  draw(ctx: CanvasRenderingContext2D, isHit: boolean) {
    const opacity = this.life / this.maxLife;
    const sizeMultiplier = this.life / this.maxLife;

    if (!isHit) {
      ctx.fillStyle = this.color.replace(/[\d\.]+\)/, `${opacity})`);
    } else {
      const baseR = 255;
      const baseG = 120; // Controls the shift from red to orange
      const baseB = 0;

      // Use a random base color for variety (0=Red, 1=Orange, 2=Yellow-Orange)
      const colorType = Math.floor(Math.random() * 3);
      let r, g, b;

      switch (colorType) {
        case 0: // Red-Orange
          r = 255;
          g = Math.floor(Math.random() * 60) + 165;
          b = 0;
          break;
        case 1: // Pure Orange
          r = 255;
          g = Math.floor(Math.random() * 40) + 120;
          b = 0;
          break;
        case 2: // Yellow-Orange (more white/bright)
          r = 255;
          g = 255;
          b = Math.floor(Math.random() * 100);
          break;
        default: // Failsafe
          r = 255;
          g = 255;
          b = 255;
          break;
      }

      const currentOpacity = opacity * (Math.random() * 0.5 + 0.5); // Add a flicker to the opacity

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentOpacity})`;
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * sizeMultiplier, 0, Math.PI * 2);
    ctx.fill();

    // testing end

    // We now use HSL for color, which doesn't directly support alpha in the string,
    // so we need to switch to RGBA for the draw operation to easily control opacity.

    // Note: Since HSL is complex to convert to RGBA manually,
    // we'll store the color as an RGBA template string to simplify the draw function:
  }
}
