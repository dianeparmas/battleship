import { useMemo, useEffect, useRef } from "react";

import { WavesCanvasProps } from "../../../types/WavesCanvas.types";

import { CANVAS_SIZE } from "../../../constants/canvasConstants";

import { drawWaves } from "../../../animations/animations";

import styles from "./WavesCanvas.module.css";

const WavesCanvas = ({
  width = 500,
  height = 500,
  id,
  className = "",
  ships,
}: WavesCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startTimeRef = useRef(performance.now());

  const shipsWithWaves = useMemo(
    () =>
      ships.map((ship) => ({
        ...ship,
        wave: {
          height: 4 + Math.random() * 6,
          length: 20 + Math.random() * 30,
          phase: Math.random() * Math.PI * 2,
        },
      })),
    [ships],
  );

  useEffect(() => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (!ctx || !shipsWithWaves.length) return;

    const animate = () => {
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000; // seconds
      const speed = elapsed * 0.8;

      shipsWithWaves.forEach((ship) => {
        drawWaves({ ctx, ship, speed });
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [shipsWithWaves]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      width={width}
      height={height}
      className={styles[className]}
    />
  );
};

export default WavesCanvas;
