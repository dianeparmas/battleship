import React, { useEffect, useRef, useState } from "react";

import {
  getMouseCoordinates,
  coordsToGridCell,
  getShipSVGId,
} from "../../../utils/canvasUtils";

import { generateSections } from "../../../helpers/battleshipHelpers.js";

import { drawRectangle } from "../../../drawing/drawing.js";

import mockOpponentBoard from "../../../assets/mockOpponentBoard.js";

import StrikesCanvas from "../StrikesCanvas/StrikesCanvas";
import RemainingShips from "../../RemainingShips/RemainingShips";

import { placeAiShips } from "../../../gameLogic/gameLogic.js";

import { Ship, StrikeObj } from "../../../types/battleship.types";

import { OpponentCanvasProps } from "../../../types/OpponentCanvas.types.js";

import {
  SHIP_SIZES,
  GRID_CELL_SIZE,
  CANVAS_SIZE,
} from "../../../constants/canvasConstants.js";

import styles from "./OpponentCanvas.module.css";

const OpponentCanvas = ({
  id,
  className = "",
  gameState,
  dispatch,
  imageCache,
}: OpponentCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const highlightCell = useRef<Ship>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    currentlyActive: false,
  });
  const [strikedSquares, setStrikedSquares] = useState<StrikeObj[]>([]);
  const [sunkenShip, setSunkenShip] = useState(null);
  const isMounted = useRef(false);

  const remainingOpponentShips = Math.abs(
    gameState.ai.ships.length - gameState.ai.destroyedShips.length,
  );

  useEffect(() => {
    const ctx = canvasRef?.current?.getContext("2d");

    if (!isMounted.current) {
      isMounted.current = true;

      if (!ctx) {
        return;
      }
      const { shipsToDraw } = placeAiShips(ctx);

      const aiShips = shipsToDraw.map((ship, i) => {
        const generateSectionsObj = {
          size: SHIP_SIZES[i],
          isHorizontalShip: ship.isHorizontal,
          xPosition: ship.x,
          yPosition: ship.y,
          gridCellSize: GRID_CELL_SIZE,
        };
        return {
          ...ship,
          currentlyActive: false,
          size: SHIP_SIZES[i],
          isDestroyed: false,
          sections: generateSections(generateSectionsObj),
        };
      });
      dispatch({ type: "SET_AI_SHIPS", ships: aiShips });
    }
    console.log("DRAWING AI SHIPS");
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef?.current?.getContext("2d");
    const { x, y } = getMouseCoordinates(event, canvasRef);
    if (ctx) {
      const activeColumn = Math.floor(x / GRID_CELL_SIZE) + 1;
      const activeRow = Math.floor(y / GRID_CELL_SIZE) + 1;
      // console.log('activeColumn:', Math.floor(x / 50) + 1, 'activeRow: ', Math.floor(y / 50) + 1);

      if (x > 0) {
        highlightCell.current = {
          y: activeRow * GRID_CELL_SIZE - GRID_CELL_SIZE,
          x: activeColumn * GRID_CELL_SIZE - GRID_CELL_SIZE,
          width: GRID_CELL_SIZE,
          height: GRID_CELL_SIZE,
        };
        drawRectangle(
          ctx,
          highlightCell.current,
          true,
          true,
          // mockOpponentBoard,
          gameState.ai.ships,
        );
        // console.log(highlightCell.current);
      }
    }
  };

  const handlePlayerTurn = (result: "hit" | "miss", cell: string) => {
    dispatch({ type: "PLAYER_TURN", result, cell });
  };

  const checkStrike = () => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (ctx && highlightCell.current) {
      let isHit = false;
      const highlightCellGrid = coordsToGridCell(
        highlightCell.current.x,
        highlightCell.current.y,
      );

      for (const ship of gameState.ai.ships) {
        // for (const ship of mockOpponentBoard) {
        isHit = ship.sections.some((rect) => {
          if (rect.cell === highlightCellGrid) {
            rect.hit = true;
            return true;
          }
        });

        if (isHit) {
          break;
        }
      }

      const currentHighLightCell = highlightCell.current;
      const struckX = currentHighLightCell.x;
      const struckY = currentHighLightCell.y;

      if (isHit) {
        console.log("Player Hit!", coordsToGridCell(struckX, struckY));
        setStrikedSquares((current) => [
          ...current,
          { currentHighLightCell, hit: true },
        ]);
        handlePlayerTurn("hit", coordsToGridCell(struckX, struckY));
      } else {
        console.log("Player Miss!", coordsToGridCell(struckX, struckY));
        setStrikedSquares((current) => [
          ...current,
          { currentHighLightCell, hit: false },
        ]);
        handlePlayerTurn("miss", coordsToGridCell(struckX, struckY));
      }
    }
  };

  useEffect(() => {
    if (sunkenShip) {
      animateSunkenShip(sunkenShip);
    }
  }, [sunkenShip]);

  useEffect(() => {
    const newlyDestroyed = gameState.ai.ships.find(
      (ship) => ship.isDestroyed && !ship._wasAnimated,
    );
    if (newlyDestroyed) {
      const newObj = { ...newlyDestroyed, animationStartTime: Date.now() };
      setSunkenShip({ ...newlyDestroyed, animationStartTime: Date.now() });

      dispatch({
        type: "SET_AI_DESTROYED_SHIPS",
        destroyedShip: newlyDestroyed,
      });
      // mark it so we don’t re-trigger
      newlyDestroyed._wasAnimated = true;
    }
  }, [gameState.ai.ships]);

  const animateSunkenShip = (shipToAnimate) => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (!ctx || !shipToAnimate) return;

    const symbolId = getShipSVGId(shipToAnimate);
    const shipImg = imageCache[symbolId];

    // CRITICAL FIX: Check if the image has been loaded before drawing
    if (!shipImg) {
      // If the image is not ready, try again on the next frame
      // requestAnimationFrame(() => animateSunkenShip(shipToAnimate));
      return;
    }

    const now = Date.now();
    const timeElapsed = now - shipToAnimate.animationStartTime;
    const duration = 1000;
    const progress = Math.min(timeElapsed / duration, 1);
    const opacity = 1 - progress;
    const maxSink = shipToAnimate.isHorizontal
      ? shipToAnimate.height * 0.4
      : 50 * 0.4;
    const yOffset = progress * maxSink;

    ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);
    ctx.save();
    ctx.globalAlpha = opacity;

    // Center of the ship for rotation
    const centerX = shipToAnimate.x + shipToAnimate.width / 2;
    const centerY = shipToAnimate.y + shipToAnimate.height / 2;

    ctx.translate(centerX, centerY);
    const maxTilt = Math.PI / 12;
    ctx.rotate(progress * maxTilt);

    ctx.drawImage(
      shipImg,
      -shipToAnimate.width / 2,
      -shipToAnimate.height / 2 + yOffset,
      shipToAnimate.width,
      shipToAnimate.height,
    );

    ctx.restore();
    if (progress < 1) {
      requestAnimationFrame(() => animateSunkenShip(shipToAnimate));
    } else {
      setSunkenShip(null);
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
          // if this is not here then if i HIT already hit cell, i won't get the log "already struck"
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
      <span className={styles.remainingOpponentShips}>
        <RemainingShips remainingShips={remainingOpponentShips} />
      </span>
      <canvas
        ref={canvasRef}
        id={id}
        width={CANVAS_SIZE.WIDTH}
        height={CANVAS_SIZE.HEIGHT}
        className={styles[className]}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        // onMouseUp={handleMouseUp}
      />
      {strikedSquares.length > 0 && (
        <StrikesCanvas
          opponentBoardStrikes={strikedSquares}
          id="opponentStrikes"
          className="opponent-strikes-canvas"
          imageCache={imageCache}
        />
      )}
    </>
  );
};

export default OpponentCanvas;
