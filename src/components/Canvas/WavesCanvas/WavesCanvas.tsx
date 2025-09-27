import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import {
  ShipWithWave,
  WavesCanvasProps,
} from "../../../types/WavesCanvas.types";

import { CANVAS_SIZE } from "../../../constants/canvasConstants";

import { drawWaves } from "../../../animations/animations";

import styles from "./WavesCanvas.module.css";

const WavesCanvas = ({ id, className = "", ships }: WavesCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const verticalWavesCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const startTimeRef = useRef(performance.now());
  const shipWavesRef = useRef<ShipWithWave[] | null>(null);

  if (shipWavesRef.current === null) {
    shipWavesRef.current = ships.map((ship) => ({
      ...ship,
      wave: {
        height: ship.isHorizontal
          ? //  minWaveHeight + (randomNr * maxRange)
            4 + Math.random() * 6
          : 3 + Math.random() * 6,
        length: ship.isHorizontal
          ? 20 + Math.random() * 30
          : 30 + Math.random() * 30,
        phase: Math.random() * Math.PI * 2,
      },
    }));
  }
  const shipsWithWaves = shipWavesRef.current;

  useEffect(() => {
    const ctx = canvasRef?.current?.getContext("2d");
    const verticalCtx = verticalWavesCanvasRef?.current?.getContext("2d");
    if (!ctx || !shipsWithWaves?.length) return;

    const animate = () => {
      if (!ctx || !verticalCtx) {
        return;
      }
      ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
      verticalCtx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000; // 1 sec
      const speed = elapsed * 0.8;

      // Iterate over the current ships prop array
      // and use the index to retrieve the corresponding wave data from the Ref.
      ships.forEach((shipStatus, index) => {
        if (shipStatus.isDestroyed) {
          return;
        }
        // Get the corresponding ship data (including static wave properties) from the Ref array
        const shipWithWaveData = shipsWithWaves[index];
        if (!shipWithWaveData) {
          return;
        }

        if (shipWithWaveData.isHorizontal) {
          drawWaves({ ctx, ship: shipWithWaveData, speed });
        } else {
          drawWaves({ ctx: verticalCtx, ship: shipWithWaveData, speed });
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [shipsWithWaves, ships]);

  const verticalWavesCanvas = (
    <canvas
      ref={verticalWavesCanvasRef}
      id="verticalWavesCanvas"
      width={CANVAS_SIZE.WIDTH}
      height={CANVAS_SIZE.HEIGHT}
      className={styles.verticalWaves}
    />
  );

  return (
    <>
      <canvas
        ref={canvasRef}
        id={id}
        width={CANVAS_SIZE.WIDTH}
        height={CANVAS_SIZE.HEIGHT}
        className={styles[className]}
      />
      {document.getElementById("playerBoardContainer") &&
        createPortal(
          verticalWavesCanvas,
          document.getElementById("playerBoardContainer") as HTMLElement,
        )}
    </>
  );
};

export default WavesCanvas;
