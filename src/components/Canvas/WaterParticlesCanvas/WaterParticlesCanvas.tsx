import { useEffect, useRef } from "react";

import { useTheme } from "../../../contexts/ThemeContext";

import { WaterParticlesCanvasProps } from "../../../types/WaterParticlesCanvas.types";

import { WaterParticle } from "../../../animations/WaterParticle";

import styles from "./WaterParticlesCanvas.module.css";

const WaterParticlesCanvas = ({
  className = "",
}: WaterParticlesCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<WaterParticle[]>([]);

  const { canvasSize, cellSize, gridCanvasSize } = useTheme();

  const MAX_SHIMMER_PARTICLES = 25;

  useEffect(() => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (!ctx) {
      return;
    }

    let animationFrameId: number;

    // Helper function: Updates and draws particles
    const updateAndDrawParticles = () => {
      let particles = particlesRef.current;
      // Update: Remove dead particles
      particles = particles.filter((p) => !p.isDead());
      // Update: Randomly create new particles
      if (particles.length < MAX_SHIMMER_PARTICLES && Math.random() < 0.2) {
        particles.push(new WaterParticle(canvasSize, canvasSize));
      }
      // Update positions
      particles.forEach((p) => p.update());

      ctx.globalCompositeOperation = "lighter";
      particles.forEach((p) => p.draw(ctx));
      ctx.globalCompositeOperation = "source-over";
      particlesRef.current = particles;
    };

    const animate = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 0 + gridCanvasSize);
      gradient.addColorStop(0, "#00aaff"); // Light blue at the top // Use colors similar to your futuristic bar (bright/deep blue)
      gradient.addColorStop(0.5, "#0088cc"); // Core water color
      gradient.addColorStop(1, "#005588"); // Dark blue at the bottom
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      updateAndDrawParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasSize]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className={styles[className]}
      style={{ top: `${cellSize - 1}px`, left: `${cellSize - 1}px` }}
    />
  );
};

export default WaterParticlesCanvas;
