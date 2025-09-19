import { Ship, StrikeObj } from "../types/battleship.types";

import iconsUrl from "../assets/icons.svg";

import { CANVAS_SIZE, GRID_CELL_SIZE } from "../constants/canvasConstants";

export const drawRectangle = (
  ctx: CanvasRenderingContext2D,
  rect: Ship,
  isHighlight?: boolean,
  isOpponentBoard?: boolean,
  mockOpponentBoard?: Ship[],
) => {
  if (isHighlight) {
    ctx.clearRect(rect.x, rect.y, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
  }
  if (isOpponentBoard) {
    ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
    mockOpponentBoard?.forEach((rect) => drawRectangle(ctx, rect));
  }
  ctx.beginPath();
  ctx.fillStyle = isHighlight ? "rgba(247, 234, 136, 0.4)" : "purple";
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.lineWidth = 2;
  ctx.stroke();
};

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  strokeColor: string,
  startingPoint: number,
) => {
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1;
  for (let x = startingPoint; x <= canvasWidth; x += GRID_CELL_SIZE) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
  }
  for (let y = startingPoint; y <= canvasHeight; y += GRID_CELL_SIZE) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
  }
  ctx.stroke();
};

const drawNumbers = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "#000";
  for (let i = 0; i < 10; i++) {
    const spacing = 90;
    const x = 25;
    const y = i === 0 ? spacing : i * GRID_CELL_SIZE + spacing;
    ctx.font = "45px serif";
    ctx.textAlign = "center";
    ctx.fillText(`${i + 1}`, x, y);
  }
};

const drawLetters = (ctx: CanvasRenderingContext2D) => {
  const letters = "ABCDEFGHIJ";
  ctx.fillStyle = "#000";
  for (let i = 0; i < letters.length; i++) {
    const spacing = 75;
    const y = 40;
    const x = i === 0 ? spacing : i * GRID_CELL_SIZE + spacing;
    ctx.font = "45px serif";
    ctx.textAlign = "center";
    ctx.fillText(letters[i], x, y);
  }
};

export const drawCoordinates = (ctx: CanvasRenderingContext2D) => {
  ctx.beginPath();
  ctx.moveTo(50, 0);
  ctx.lineTo(600, 0);
  ctx.closePath();
  ctx.moveTo(0, 50);
  ctx.lineTo(0, 600);
  ctx.closePath();
  ctx.lineWidth = 5;
  ctx.stroke();

  drawNumbers(ctx);
  drawLetters(ctx);
};

export const drawStrike = (
  ctx: CanvasRenderingContext2D,
  strikeObj: StrikeObj,
) => {
  const { currentHighLightCell, hit } = strikeObj;
  const symbolId = hit ? "fire" : "explosion";

  drawSvgSymbolOnCanvas(
    ctx,
    symbolId,
    currentHighLightCell.x,
    currentHighLightCell.y,
    50,
    50,
    iconsUrl,
  );
};

export const drawSvgSymbolOnCanvas = (
  ctx: CanvasRenderingContext2D,
  symbolId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  spriteUrl: string,
) => {
  // Fetch the sprite file and extract the symbol
  fetch(spriteUrl)
    .then((res) => res.text())
    .then((svgText) => {
      // Parse the SVG text
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
      const symbol = svgDoc.getElementById(symbolId);
      if (!symbol) return;

      // Create a standalone SVG with the symbol's content
      const viewBox = symbol.getAttribute("viewBox") || "0 0 50 50";
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
          ${symbol.innerHTML}
        </svg>
      `;
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const img = new window.Image();
      img.onload = function () {
        if (symbolId === "fire" || symbolId === "explosion") {
          ctx.save();
          ctx.globalAlpha = 0.7 + Math.random() * 0.3; // flicker between 0.7–1.0
          const scale = 1 + (Math.random() - 0.5) * 0.1; // scale ±10%
          ctx.drawImage(img, x, y, width * scale, height * scale);
          ctx.restore();
        } else {
          ctx.drawImage(img, x, y, width, height);
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
};
