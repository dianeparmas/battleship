import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { GameResultsOverlayProps } from "../../types/GameResultsOverlay.types";

import styles from "./GameResultsOverlay.module.css";

const GameResultsOverlay = ({ gameState }: GameResultsOverlayProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const timeoutRef = useRef<number | null>(null);
  const confettiTimeoutRef = useRef<number | null>(null);

  const isPlayerWinner = gameState.status === "playerWon";
  const winnerText = isPlayerWinner ? "You won!" : "AI won!";

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShowOverlay(true);
      if (!isPlayerWinner) {
        const audio = new Audio("/assets/loss.mp3");
        audio
          .play()
          .catch((err) => console.warn("Audio playback blocked:", err));
      }
    }, 1200);
    confettiTimeoutRef.current = setTimeout(() => {
      setShowConfetti(true);
    }, 1600);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
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

  const handleStartNewGame = () => {};

  const getRandomColor = () => {
    const colors = [
      "#ff5252",
      "#fbe308ff",
      "#4caf50",
      "#03a9f4",
      "#ff9800",
      "#e91e63",
      "#3dfa9fff",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const createConfetti = (position: "left" | "right") => {
    const confettiCount = 100;
    const radius = 220;
    const confettiPieces = Array.from({ length: confettiCount }, (_, i) => i);
    return (
      <div
        className={styles.confettiContainer}
        style={{
          [position]: 0,
        }}
      >
        {confettiPieces.map((i) => {
          const angle = (2 * Math.PI * i) / confettiCount;
          const xDirection = Math.cos(angle) * radius;
          const yDirection = Math.sin(angle) * radius;

          return (
            <div
              key={i}
              className={styles.confetti}
              style={
                {
                  left: "50%",
                  top: "50%",
                  width: `${Math.random() * 6 + 4}px`,
                  height: `${Math.random() * 6 + 4}px`,
                  backgroundColor: getRandomColor(),
                  animation: `${styles.burst} ${Math.random() * 1.5 + 0.15}s ease-out forwards`,
                  "--x": `${xDirection}px`,
                  "--y": `${yDirection}px`,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>
    );
  };

  return (
    document.getElementById("root") &&
    showOverlay &&
    createPortal(
      <section className={styles.overlayWrapper}>
        <div className={styles.overlayContent}>
          {isPlayerWinner && showConfetti && createConfetti("left")}
          {isPlayerWinner && showConfetti && createConfetti("right")}
          <h2>{winnerText}</h2>
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
