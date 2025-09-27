import { ImageCache, Ship } from "./battleship.types";

type flamePhaseType = Record<string, number>;
type shipPhaseType = Record<string, number>;

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
//export type ImageCache = { current: Record<string, HTMLImageElement> };
export interface FloatingParams {
  ctx: CanvasRenderingContext2D | null | undefined;
  ship: Ship;
  now: number;
  // imageCache: {
  //   current: {
  //     [key: string]: HTMLImageElement;
  //   };
  // };
  imageCache: Record<string, HTMLImageElement>;
  shipPhases: shipPhaseType;
}

export interface WavesParams {
  ctx: CanvasRenderingContext2D | null | undefined;
  ship: Ship & {
    wave: {
      height: number;
      length: number;
      phase: number;
    };
  };
  speed: number;
}

export interface SinkingShipParams {
  ctx: CanvasRenderingContext2D | null | undefined;
  shipToAnimate: Ship;
  shipImg: CanvasImageSource;
  progress: number;
}
