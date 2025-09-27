import { ImageCache } from "./battleship.types";

export interface svgSymbolParams {
  ctx: CanvasRenderingContext2D;
  symbolId: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  spriteUrl: string;
  drawShip?: boolean;
  imageCache: { current: ImageCache };
}
