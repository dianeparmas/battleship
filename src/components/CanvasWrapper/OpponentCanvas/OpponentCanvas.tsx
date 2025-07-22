import React, { useEffect, useRef, useState } from "react";

import {
  drawRectangle,
  getMouseCoordinates,
  // getMouseOffsetCoordinates,
} from "../../../utils/canvasUtils";

import mockOpponentBoard from "../../../assets/mockOpponentBoard.js";

import OpponentBoardStrikesCanvas from "../OpponentBoardStrikesCanvas/OpponentBoardStrikesCanvas";

import {
  CanvasProps,
  // CoordinatePoints,
  Ship,
  StrikeObj,
} from "../../../types/battleship.types";

import styles from "./OpponentCanvas.module.css";

const OpponentCanvas = ({
  width = 500,
  height = 500,
  id,
  className = "",
  gridCellSize = 50,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const highlightCell = useRef<Ship>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    currentlyActive: false,
  });
  const [strikedSquares, setStrikedSquares] = useState<StrikeObj[]>([]);

  useEffect(() => {
    console.log(mockOpponentBoard);
    const ctx = canvasRef?.current?.getContext("2d");
    if (ctx) {
      mockOpponentBoard.forEach((rect) => drawRectangle(ctx, rect));
    }
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef?.current?.getContext("2d");
    const { x, y } = getMouseCoordinates(event, canvasRef);
    if (ctx) {
      const activeColumn = Math.floor(x / gridCellSize) + 1;
      const activeRow = Math.floor(y / gridCellSize) + 1;
      // console.log('activeColumn:', Math.floor(x / 50) + 1, 'activeRow: ', Math.floor(y / 50) + 1);

      if (x > 0) {
        highlightCell.current = {
          y: activeRow * gridCellSize - gridCellSize,
          x: activeColumn * gridCellSize - gridCellSize,
          width: gridCellSize,
          height: gridCellSize,
        };
        drawRectangle(
          ctx,
          highlightCell.current,
          true,
          true,
          mockOpponentBoard,
        );
        // console.log(highlightCell.current);
      }
    }
  };

  const checkStrike = () => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (ctx && highlightCell.current) {
      let isHit = false;
      for (const ship of mockOpponentBoard) {
        isHit = ship.sections.some((rect) => {
          if (
            rect.x === highlightCell.current.x &&
            rect.y === highlightCell.current.y
          ) {
            rect.hit = true;
            return true;
          }
        });

        if (isHit) {
          break;
        }
      }

      const currentHighLightCell = highlightCell.current;

      if (isHit) {
        console.log("Hit!", currentHighLightCell);
        setStrikedSquares((current) => [
          ...current,
          { currentHighLightCell, hit: true },
        ]);
      } else {
        console.log("Miss!");
        setStrikedSquares((current) => [
          ...current,
          { currentHighLightCell, hit: false },
        ]);
      }
    }
  };

  const handleMouseDown = () => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (ctx && highlightCell.current) {
      let isStruck = false;
      for (const strike of strikedSquares) {
        if (
          strike.currentHighLightCell.x === highlightCell.current.x &&
          strike.currentHighLightCell.y === highlightCell.current.y
        ) {
          isStruck = true;
          break;
        }
      }
      if (!isStruck) {
        checkStrike();
      } else {
        console.log("Already struck at this position!");
      }
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        id={id}
        width={width}
        height={height}
        className={styles[className]}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        // onMouseUp={handleMouseUp}
      />
      <p></p>
      {strikedSquares.length && (
        <OpponentBoardStrikesCanvas
          strikedSquares={strikedSquares}
          gridCellSize={50}
          id="opponentStrikes"
          className="opponent-strikes-canvas"
        />
      )}
    </>
  );
};

export default OpponentCanvas;
