import React, { useEffect, useRef, useState } from "react";

import {
  getMouseCoordinates,
  coordsToGridCell,
  getShipSVGId,
} from "../../../utils/canvasUtils";

import { generateSections } from "../../../helpers/battleshipHelpers.js";

import { drawSinkingShip } from "../../../animations/animations";
// import { drawRectangle } from "../../../drawing/drawing";

import StrikesCanvas from "../StrikesCanvas/StrikesCanvas";
import RemainingShips from "../../RemainingShips/RemainingShips";

import { placeAiShips } from "../../../gameLogic/gameLogic";

import { Ship, StrikeObj, SunkenShip } from "../../../types/battleship.types";

import {
  HighlightCell,
  OpponentCanvasProps,
} from "../../../types/OpponentCanvas.types";

import {
  SHIP_SIZES,
  GRID_CELL_SIZE,
  CANVAS_SIZE,
} from "../../../constants/canvasConstants";

import styles from "./OpponentCanvas.module.css";

const OpponentCanvas = ({
  id,
  className = "",
  gameState,
  dispatch,
  imageCache,
}: OpponentCanvasProps) => {
  const [strikedSquares, setStrikedSquares] = useState<StrikeObj[]>([]);
  const [sunkenShip, setSunkenShip] = useState<SunkenShip | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const highlightCell = useRef<HighlightCell>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    currentlyActive: false,
  });
  const isMounted = useRef(false);

  const ctx = canvasRef?.current?.getContext("2d");
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
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMouseCoordinates(event, canvasRef);
    if (ctx) {
      const activeColumn = Math.floor(x / GRID_CELL_SIZE) + 1;
      const activeRow = Math.floor(y / GRID_CELL_SIZE) + 1;

      if (x > 0) {
        highlightCell.current = {
          y: activeRow * GRID_CELL_SIZE - GRID_CELL_SIZE,
          x: activeColumn * GRID_CELL_SIZE - GRID_CELL_SIZE,
          width: GRID_CELL_SIZE,
          height: GRID_CELL_SIZE,
        };
        // dont think we need this
        // drawRectangle(
        //   ctx,
        //   highlightCell.current,
        //   true,
        //   true,
        //   gameState.ai.ships,
        // );
      }
    }
  };

  const handlePlayerTurn = (result: "hit" | "miss", cell: string) => {
    dispatch({ type: "PLAYER_TURN", result, cell });
  };

  const checkStrike = () => {
    // const ctx = canvasRef?.current?.getContext("2d");
    if (ctx && highlightCell.current) {
      let isHit = false;
      const highlightCellGrid = coordsToGridCell(
        highlightCell.current.x,
        highlightCell.current.y,
      );

      for (const ship of gameState.ai.ships) {
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

      const struckCell = coordsToGridCell(struckX, struckY);
      if (!struckCell) {
        return;
      }

      if (isHit) {
        console.log("Player Hit!", struckCell);
        setStrikedSquares((current) => [
          ...current,
          { currentHighLightCell, hit: true },
        ]);
        handlePlayerTurn("hit", struckCell);
      } else {
        console.log("Player Miss!", struckCell);
        setStrikedSquares((current) => [
          ...current,
          { currentHighLightCell, hit: false },
        ]);
        handlePlayerTurn("miss", struckCell);
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
      setSunkenShip({ ...newlyDestroyed, animationStartTime: Date.now() });

      dispatch({
        type: "SET_AI_DESTROYED_SHIPS",
        destroyedShip: newlyDestroyed,
      });
      // mark it so we don’t re-trigger
      newlyDestroyed._wasAnimated = true;
    }
  }, [gameState.ai.ships]);

  const animateSunkenShip = (shipToAnimate: Ship) => {
    const ctx = canvasRef?.current?.getContext("2d");
    if (!ctx || !shipToAnimate) return;

    ctx.clearRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT);

    const symbolId = getShipSVGId(shipToAnimate);
    const shipImg = imageCache[symbolId];

    const now = Date.now();
    const timeElapsed = now - (shipToAnimate.animationStartTime ?? 0);
    const duration = 1000;
    const progress = Math.min(timeElapsed / duration, 1);

    const sinkingShipParams = {
      ctx,
      shipToAnimate,
      imageCache,
      progress,
      shipImg,
    };

    drawSinkingShip(sinkingShipParams);

    ctx.restore();
    if (progress < 1) {
      requestAnimationFrame(() => animateSunkenShip(shipToAnimate));
    } else {
      setSunkenShip(null);
    }
  };

  const handleMouseDown = () => {
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
