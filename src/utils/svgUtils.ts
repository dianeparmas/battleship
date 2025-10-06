import { Ship, ShipSize } from "../types/battleship.types";

import SVG_SYMBOL_IDS from "../constants/svgIds";
import SHIP_IMAGES from "../constants/shipImages";

export const getShipSVGId = (ship: Ship) => {
  return ship.isHorizontal
    ? SHIP_IMAGES[ship.size as ShipSize]
    : "vertical_" + SHIP_IMAGES[ship.size as ShipSize];
};

export const loadSvgSprite = async (spriteUrl: string) => {
  const res = await fetch(spriteUrl);
  const svgText = await res.text();
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
  const newCache: Record<string, HTMLImageElement> = {};
  const symbols = Object.values(SVG_SYMBOL_IDS);

  await Promise.all(
    symbols.map((id) => {
      return new Promise<void>((resolve) => {
        const symbol = svgDoc.getElementById(id);
        if (!symbol) {
          resolve();
          return;
        }

        const viewBox = symbol.getAttribute("viewBox") || "0 0 50 50";
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
            ${symbol.innerHTML}
          </svg>
        `;

        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        const img = new Image();
        img.onload = () => {
          newCache[id] = img;
          URL.revokeObjectURL(url);
          resolve();
        };
        img.src = url;
      });
    }),
  );

  return newCache;
};
