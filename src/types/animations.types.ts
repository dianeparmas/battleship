import React from "react";

type flamePhaseType = Record<string, number>;

export interface FireFlickerParams {
  ctx: CanvasRenderingContext2D | null | undefined;
  symbolId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  phaseKey: string;
  svgImageCache: {
    // fire: string;
    // explosion: string;
    // [key: string]: string;
    [key: string]: HTMLImageElement;
  };
  flamePhases: flamePhaseType;
}

export interface WaterExplosionParams {
  ctx: CanvasRenderingContext2D | null | undefined;
  x: number;
  y: number;
  width: number;
  height: number;
  key: string;
  now: number;
  svgImageCache: {
    [key: string]: HTMLImageElement;
  };
  missStartTimes: {
    current: {
      [key: string]: number;
    };
  };
}
