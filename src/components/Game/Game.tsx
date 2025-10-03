import { useCallback, useEffect, useRef, useReducer, useState } from "react";

import { ImageCache, Ship } from "../../types/battleship.types";
import { Difficulty, GameState } from "../../types/gameState.types";

import { gameReducer, initialGameState } from "../../reducers/gameReducer";

import { checkStrike } from "../../gameLogic/gameLogic";
import {
  normalAIMove,
  realisticAIMove,
  simpleAIMove,
} from "../../gameLogic/aiLogic";

import { loadSvgSprite } from "../../utils/canvasUtils";

import GameResultsOverlay from "../GameResultsOverlay/GameResultsOverlay";
import GridCanvas from "../Canvas/GridCanvas/GridCanvas";
import OpponentCanvas from "../Canvas/OpponentCanvas/OpponentCanvas";
import PlayerShipsCanvas from "../Canvas/PlayerShipsCanvas/PlayerShipsCanvas";
import ShipPlacementCanvas from "../Canvas/ShipPlacementCanvas/ShipPlacementCanvas";
import LoadingBar from "../LoadingBar/LoadingBar";
import StrikesCanvas from "../Canvas/StrikesCanvas/StrikesCanvas";
import SunkenShipsCanvas from "../Canvas/SunkenShipsCanvas/SunkenShipsCanvas";
import WavesCanvas from "../Canvas/WavesCanvas/WavesCanvas";

import styles from "./Game.module.css";

const Game = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [imageCache, setImageCache] = useState<ImageCache>({});

  const aiMoveTimeoutRef = useRef<number | null>(null);
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  const isGameOver =
    gameState.status === "playerWon" || gameState.status === "aiWon";
  const isGameTime = gameState.status === "playing" || isGameOver;

  useEffect(() => {
    loadSvgSprite("./src/assets/icons.svg").then(setImageCache);
  }, []);

  const gameLogic = (state: GameState) => {
    const isAiTurn = state.currentTurn === "ai";

    if (isAiTurn) {
      let move;

      // Combine hits and misses to get all tried cells
      const triedCells = [...state.ai.hits, ...state.ai.misses];

      if (state.difficulty === "easy") {
        move = simpleAIMove(triedCells);
      } else if (state.difficulty === "normal") {
        move = normalAIMove(state.ai.hits, state.ai.misses, triedCells);
      } else {
        move = realisticAIMove(
          state.ai.hits,
          state.ai.misses,
          triedCells,
          state.player.destroyedShips,
        );
      }
      dispatch({
        type: "SET_AI_MOVE",
        move,
      });
      // Prevent duplicate moves (but extra guard)
      if (triedCells.includes(move)) {
        console.warn("AI tried to repeat move:", move);
        return;
      }
      const isAiHit = checkStrike(move, state);
      dispatch({
        type: "SET_AI_TURN",
        move,
        isHit: isAiHit,
      });
    }
  };

  useEffect(() => {
    console.log("%c ISLOADING IN GAME", "font-size: 30px;", isLoading);
  }, [isLoading]);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
    console.log("Loading complete! Game ready.");
  }, []);

  const handleBeginGame = (playerShips: Ship[]) => {
    setIsLoading(true);
    dispatch({ type: "BEGIN_GAME", status: "playing", ships: playerShips });
    // setIsLoading(true);
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
            name="difficultyRadio"
            value="easy"
            // defaultChecked={true}
            // value={firstName} // ...force the input's value to match the state variable...
            onChange={(e) => changeGameDifficulty(e.target.value as Difficulty)}
          />
          Easy
        </label>
        <label>
          <input
            type="radio"
            name="difficultyRadio"
            value="normal"
            onChange={(e) => changeGameDifficulty(e.target.value as Difficulty)}
          />
          Normal
        </label>
        <label>
          <input
            type="radio"
            name="difficultyRadio"
            value="realistic"
            defaultChecked={true}
            onChange={(e) => changeGameDifficulty(e.target.value as Difficulty)}
          />
          Realistic
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
              handleBeginGame={handleBeginGame}
              imageCache={imageCache}
            />
          ) : (
            <>
              {Object.keys(imageCache).length && (
                <>
                  <PlayerShipsCanvas
                    playerShips={gameState.player.ships}
                    className="player-ships-canvas"
                    id="playerShipsCanvas"
                    dispatch={dispatch}
                    gameState={gameState}
                    imageCache={imageCache}
                  />
                  <SunkenShipsCanvas
                    id="sunkenShipsCanvas"
                    className="sunkenShipsCanvas"
                    sunkenShips={gameState.player.destroyedShips}
                    imageCache={imageCache}
                  />
                  <StrikesCanvas
                    id="playerStrikes"
                    className="player-strikes-canvas"
                    isPlayerStrikes
                    playerBoardStrikes={gameState.ai}
                    imageCache={imageCache}
                  />
                  <WavesCanvas
                    ships={gameState.player.ships}
                    className="player-waves-canvas"
                    id="playerWavesCanvas"
                  />
                </>
              )}
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
                imageCache={imageCache}
              />
              <OpponentCanvas
                id="opponent"
                className="opponent-canvas"
                dispatch={dispatch}
                gameState={gameState}
                imageCache={imageCache}
              />
            </section>
          </>
        )}
      </div>
      {isLoading && (
        <div className={styles.loadingBarWrapper}>
          <LoadingBar
            onComplete={handleLoadingComplete}
            minLoadTime={1500}
            maxLoadTime={2500}
          />
        </div>
      )}
      {isGameOver && <GameResultsOverlay gameState={gameState} />}
    </div>
  );
};

export default Game;
