import { useEffect, useRef, useReducer, useState } from "react";

import { Ship } from "../../types/battleship.types";
import { Difficulty } from "../../types/gameState.types";

import styles from "./Game.module.css";

import ShipPlacementCanvas from "../Canvas/ShipPlacementCanvas/ShipPlacementCanvas";
import GridCanvas from "../Canvas/GridCanvas/GridCanvas";
import OpponentCanvas from "../Canvas/OpponentCanvas/OpponentCanvas";
import StrikesCanvas from "../Canvas/StrikesCanvas/StrikesCanvas";
import PlayerShipsCanvas from "../Canvas/PlayerShipsCanvas/PlayerShipsCanvas";
import SunkenShipsCanvas from "../Canvas/SunkenShipsCanvas/SunkenShipsCanvas";
import WavesCanvas from "../Canvas/WavesCanvas/WavesCanvas";

import { gameReducer, initialGameState } from "../../reducers/gameReducer";

import { normalAIMove, simpleAIMove } from "../../gameLogic/aiLogic";

import { checkStrike } from "../../gameLogic/gameLogic";

const Game = () => {
  // const [ships, setShips] = useState([]);
  const aiMoveTimeoutRef = useRef<number | null>(null);
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  const gameLogic = (state) => {
    const isAiTurn = state.currentTurn === "ai";

    if (isAiTurn) {
      let move;

      // Combine hits and misses to get all tried cells
      const triedCells = [...state.ai.hits, ...state.ai.misses];

      if (state.difficulty === "easy") {
        // move = simpleAIMove(state.player.hits, state.player.misses, triedCells);
        move = simpleAIMove(triedCells);
      } else {
        move = normalAIMove(state.ai.hits, state.ai.misses, triedCells);
      }
      dispatch({
        type: "SET_AI_MOVE",
        move,
      });
      // Prevent duplicate moves (shouldn't happen, but extra guard)
      if (triedCells.includes(move)) {
        console.warn("AI tried to repeat move:", move);
        return;
      }
      const isAiHit = checkStrike(move, state);
      console.log("GAME.TSX AI move:", move); // "H3"
      dispatch({
        type: "SET_AI_TURN",
        move,
        isHit: isAiHit,
      });
    }
  };

  // const drawShips = (drawShips) => {
  //uueneb siis kui dragimis lõpetan
  // setShips(drawShips);
  // };

  const handleBeginGame = (playerShips: Ship[]) => {
    dispatch({ type: "BEGIN_GAME", status: "playing", ships: playerShips });
  };

  useEffect(() => {
    // Only run gameLogic immediately if NOT AI's turn
    if (gameState.currentTurn !== "ai") {
      gameLogic(gameState);
    } else {
      // If AI's turn, delay the move for better UX
      if (aiMoveTimeoutRef.current) clearTimeout(aiMoveTimeoutRef.current);
      aiMoveTimeoutRef.current = setTimeout(() => {
        gameLogic(gameState);
      }, 700);
    }
    // Cleanup on unmount
    return () => {
      if (aiMoveTimeoutRef.current) clearTimeout(aiMoveTimeoutRef.current);
    };
  }, [gameState]);

  const changeGameDifficulty = (difficulty: Difficulty) => {
    dispatch({ type: "CHANGE_DIFFICULTY", difficulty });
  };

  const isGameTime = gameState.status === "playing";

  const renderGridCanvas = (id: string, className: string) => {
    return (
      <GridCanvas
        id={id}
        startingPoint={50}
        className={className}
        isGameTime={isGameTime}
      />
    );
  };

  return (
    <div className={isGameTime ? styles.canvasWrapper : undefined}>
      <div className={styles.difficultySelect}>
        <span>AI difficulty:</span>
        <label>
          <input
            type="radio"
            name="myRadio"
            value="easy"
            defaultChecked={true}
            // value={firstName} // ...force the input's value to match the state variable...
            onChange={(e) => changeGameDifficulty(e.target.value)} // ... and update the state variable on any edits!
          />
          Easy
        </label>
        <label>
          <input
            type="radio"
            name="myRadio"
            value="normal"
            onChange={(e) => changeGameDifficulty(e.target.value)}
          />
          Normal
        </label>
      </div>

      <div className={styles.playgroundContainer}>
        <section
          id="playerBoardContainer"
          className={styles.playerBoardContainer}
        >
          <span className={styles.playerLabel}>Player Board</span>
          {renderGridCanvas("coordinates", "grid-canvas")}
          {!isGameTime ? (
            <ShipPlacementCanvas
              isGameTime={isGameTime}
              id="ships"
              className="ships-canvas"
              // setShips={drawShips}
              handleBeginGame={handleBeginGame}
            />
          ) : (
            <>
              <PlayerShipsCanvas
                playerShips={gameState.player.ships}
                className="player-ships-canvas"
                id="playerShipsCanvas"
                dispatch={dispatch}
                gameState={gameState}
              />
              <SunkenShipsCanvas
                id="sunkenShipsCanvas"
                className="sunkenShipsCanvas"
                sunkenShips
              />
              <StrikesCanvas
                strikedSquares={gameState.ai}
                gridCellSize={50}
                id="playerStrikes"
                className="player-strikes-canvas"
                isPlayerStrikes
              />
              <WavesCanvas
                ships={gameState.player.ships}
                className="player-waves-canvas"
                id="playerWavesCanvas"
              />
            </>
          )}
        </section>

        {isGameTime && (
          <>
            <div className={styles.currentTurn}>
              Current turn: {gameState.currentTurn}
            </div>
            <section className={styles.opponentBoardContainer}>
              {renderGridCanvas("opponentCoordinates", "gridCanvasOpponent")}
              <span className={styles.opponentLabel}>Opponent Board</span>
              <SunkenShipsCanvas
                id="sunkenShipsCanvasOpponent"
                className="sunkenShipsCanvas"
                sunkenShips={gameState.ai.destroyedShips}
              />
              <OpponentCanvas
                id="opponent"
                className="opponent-canvas"
                dispatch={dispatch}
                gameState={gameState}
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Game;
