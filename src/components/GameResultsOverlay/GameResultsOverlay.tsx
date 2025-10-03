import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { GameResultsOverlayProps } from "../../types/GameResultsOverlay.types";

import styles from "./GameResultsOverlay.module.css";

const GameResultsOverlay = ({ gameState }: GameResultsOverlayProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const winner = gameState.status === "playerWon" ? "You won!" : "AI won!";

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowOverlay(true);
    }, 1200);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const renderAnalytics = () => {
    const playerHits = gameState.player.hits.length;
    const playerMisses = gameState.player.misses.length;
    const aiHits = gameState.ai.hits.length;
    const aiMisses = gameState.ai.misses.length;

    const playerStrikes = playerHits + playerMisses;
    const aiStrikes = aiHits + aiMisses;
    const playerStrikeAccuracy = (playerHits / playerStrikes) * 100;
    const aiStrikeAccuracy = (aiHits / aiStrikes) * 100;

    const minTotalStrikes = 17;
    const playerEfficiency = (minTotalStrikes / playerStrikes) * 100;

    return (
      <div className={styles.analyticsContainer}>
        <div className={styles.playerAnalytics}>
          <p>Player strike accuracy: {playerStrikeAccuracy.toFixed(2)}%</p>
          <p>Player objective efficiency: {playerEfficiency.toFixed(2)}%</p>
          <p>Ships remaining: {5 - gameState.player.destroyedShips.length}</p>
        </div>
        <div className={styles.aiAnalytics}>
          <p>AI strike accuracy: {aiStrikeAccuracy.toFixed(2)}%</p>
          <p>Ships remaining: {5 - gameState.ai.destroyedShips.length}</p>
        </div>
      </div>
    );
  };

  const handleStartNewGame = () => {

  };

  return (
    document.getElementById("root") &&
    showOverlay &&
    createPortal(
      <section className={styles.overlayWrapper}>
        <div className={styles.overlayContent}>
          <h2>{winner}</h2>
          <div>{renderAnalytics()}</div>
          <button onClick={handleStartNewGame} className={styles.newGameBtn}>
            Play again
          </button>
        </div>
      </section>,
      document.getElementById("root") as HTMLElement,
    )
  );
};

export default GameResultsOverlay;
