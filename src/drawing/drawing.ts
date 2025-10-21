import { Ship, StrikeObj } from "../types/battleship.types";
import { svgSymbolParams } from "../types/drawing.types";

import iconsUrl from "../assets/icons.svg";

import { CANVAS_SIZE } from "../constants/canvasConstants";
import SVG_SYMBOL_IDS from "../constants/svgIds";

export const drawInvalidLines = (invalidLinesParams) => {
  const { ctx, movedShip, collidingShip } = invalidLinesParams;
  if (collidingShip) {
    ctx.rect(
      collidingShip.x,
      collidingShip.y,
      collidingShip.width,
      collidingShip.height,
    );
  }
  ctx.rect(movedShip.x, movedShip.y, movedShip.width, movedShip.height);
  ctx.strokeStyle = "red";
  ctx.stroke();
};

export const drawRectangle = (
  ctx: CanvasRenderingContext2D,
  rect: Ship, //siin on viga
  isHighlight?: boolean,
  isOpponentBoard?: boolean,
) => {
  // if (isHighlight) {
  //   ctx.clearRect(rect.x, rect.y, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
  // }
  // if (isOpponentBoard) {
  //   ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
  // }
  console.log("drawRectangle");
  ctx.beginPath();
  ctx.fillStyle = isHighlight ? "rgba(247, 234, 136, 0.4)" : "purple";
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.lineWidth = 2;
  ctx.stroke();
};

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  strokeStyle: string,
) => {
  if (!canvasSize) {
    return;
  }

  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 1;

  const requiredCells = 11;
  const gridCellSize = canvasSize / requiredCells;
  const startingPoint = gridCellSize;

  for (let x = startingPoint; x <= canvasSize; x += gridCellSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasSize);
  }
  for (let y = startingPoint; y <= canvasSize; y += gridCellSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvasSize, y);
  }
  ctx.stroke();
};

const drawNumbers = (ctx: CanvasRenderingContext2D, cellSize: number) => {
  const fontSize = cellSize * 0.8;
  const xPos = cellSize * 0.5;
  const spacing = cellSize * 1.8;

  ctx.fillStyle = "#000";
  ctx.font = `${fontSize}px serif`;
  ctx.textAlign = "center";

  for (let i = 0; i < 10; i++) {
    const y = i === 0 ? spacing : i * cellSize + spacing;
    ctx.fillText(`${i + 1}`, xPos, y);
  }
};

const drawLetters = (ctx: CanvasRenderingContext2D, cellSize: number) => {
  const letters = "ABCDEFGHIJ";
  const fontSize = cellSize * 0.8;
  const yPos = cellSize * 0.8;
  const spacing = cellSize * 1.5;

  ctx.fillStyle = "#000";
  ctx.font = `${fontSize}px serif`;
  ctx.textAlign = "center";

  for (let i = 0; i < letters.length; i++) {
    const x = i === 0 ? spacing : i * cellSize + spacing;
    ctx.fillText(letters[i], x, yPos);
  }
};

export const drawCoordinates = (
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
) => {
  const REQUIRED_CELLS = 11;
  const GRID_CELLSIZE = canvasSize / REQUIRED_CELLS;

  // left-top borders
  ctx.beginPath();
  ctx.moveTo(GRID_CELLSIZE, 0);
  ctx.lineTo(canvasSize, 0);
  ctx.closePath();
  ctx.moveTo(0, GRID_CELLSIZE);
  ctx.lineTo(0, canvasSize);
  ctx.closePath();
  ctx.lineWidth = 5;
  ctx.stroke();

  drawNumbers(ctx, GRID_CELLSIZE);
  drawLetters(ctx, GRID_CELLSIZE);
};

export const drawStrike = (
  ctx: CanvasRenderingContext2D,
  strikeObj: StrikeObj,
) => {
  const { currentHighLightCell, hit } = strikeObj;
  const symbolId = hit ? SVG_SYMBOL_IDS.FIRE : SVG_SYMBOL_IDS.EXPLOSION;

  const svgDrawParams = {
    ctx,
    symbolId,
    x: currentHighLightCell.x,
    y: currentHighLightCell.y,
    spriteUrl: iconsUrl,
    width: 50,
    height: 50,
  };
  // drawSvgSymbolOnCanvas(
  //   ctx,
  //   symbolId,
  //   currentHighLightCell.x,
  //   currentHighLightCell.y,
  //   50,
  //   50,
  //   iconsUrl,
  // );
  drawSvgSymbolOnCanvas(svgDrawParams);
};

//triggerib hetkel ainult siis kui GAMETIME ja joonistame Player shipid
export const drawSvgSymbolOnCanvas = (svgSymbolParams: svgSymbolParams) => {
  const {
    ctx,
    symbolId,
    x,
    y,
    width,
    height,
    spriteUrl,
    drawShip,
    imageCache,
  } = svgSymbolParams;
  // console.log(svgSymbolParams);
  // Fetch the sprite file and extract the symbol
  fetch(spriteUrl)
    .then((res) => res.text())
    .then((svgText) => {
      // Parse the SVG text
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
      const symbol = svgDoc.getElementById(symbolId);
      // console.log(symbol);
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
        if (
          symbolId === SVG_SYMBOL_IDS.FIRE ||
          symbolId === SVG_SYMBOL_IDS.EXPLOSION
        ) {
          console.log("IFFFFFFFFFFFFFFFFFFFFFFFFFFF");
          ctx.save();
          ctx.globalAlpha = 0.7 + Math.random() * 0.3; // flicker between 0.7–1.0
          const scale = 1 + (Math.random() - 0.5) * 0.1; // scale ±10%
          ctx.drawImage(img, x, y, width * scale, height * scale);
          ctx.restore();
        } else if (drawShip) {
          // console.log('else if (drawShip)', img);
          //kui img.onload ja URL.revoke välja kommenteerida siis ei tööta
          // img.onload = function () {
          imageCache.current[symbolId] = img;
          // URL.revokeObjectURL(url);
          // };
          // img.src = url;
        } else {
          console.log("else");
          ctx.drawImage(img, x, y, width, height);
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
};
