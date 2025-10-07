// --- PARTICLE CLASS (Water Reflection) ---
// Defined outside the component to avoid re-creation on every render
export class WaterParticle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  fadeRate: number;
  velocity: { x: number; y: number };

  constructor(width: number, height: number) {
    // Random position within the canvas boundaries
    this.x = Math.random() * width;
    this.y = Math.random() * height;

    this.size = Math.random() * 5 + 3;
    // this.alpha = 0.5;
    // NEW: Lower starting alpha for better blending
    this.alpha = 0.3;
    // this.fadeRate = Math.random() * 0.01 + 0.005;
    // SLOWED FADE: Reduced max fadeRate from 0.015 to 0.004
    // this.fadeRate = Math.random() * 0.003 + 0.001;
    // NEW: Greatly reduced fade rate (range [0.0001, 0.001]) for longer lifespan
    this.fadeRate = Math.random() * 0.0009 + 0.0001;

    // this.velocity = {
    //   x: Math.random() * 0.5 - 0.25,
    //   y: Math.random() * 0.5 - 0.25,
    // };
    // SLOWED VELOCITY: Reduced max speed from 0.25 to 0.05
    // this.velocity = {
    //   x: Math.random() * 0.1 - 0.05,
    //   y: Math.random() * 0.1 - 0.05,
    // };
    // NEW: Reduced max speed from 0.05 to 0.025
    this.velocity = {
      x: Math.random() * 0.05 - 0.025,
      y: Math.random() * 0.05 - 0.025,
    };
  }

  update() {
    this.alpha -= this.fadeRate;
    // this.size -= 0.05;
    // SLOWED SHRINK: Reduced size reduction from 0.05 to 0.01
    this.size -= 0.01;

    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Use a soft, circular shape for the shimmer
    // ctx.fillStyle = `pink`;
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
    ctx.fill();
  }

  isDead() {
    return this.alpha <= 0 || this.size <= 0;
  }
}
