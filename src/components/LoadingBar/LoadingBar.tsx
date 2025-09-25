import { useState, useEffect } from "react";

import { LoadingBarProps } from "../../types/LoadingBar.types";

import styles from "./LoadingBar.module.css";

const LoadingBar = ({
  onComplete,
  minLoadTime = 1500, // Default 1.5 seconds
  maxLoadTime = 5000, // Default 5 seconds
}: LoadingBarProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: number;
    let totalLoadTime =
      Math.random() * (maxLoadTime - minLoadTime) + minLoadTime;
    let startTime = Date.now();

    const updateProgress = () => {
      const elapsedTime = Date.now() - startTime;
      let newProgress = Math.min(100, (elapsedTime / totalLoadTime) * 100);

      // Introduce a bit of random "spikiness" to progress updates
      // This makes it feel less linear and more like individual assets loading
      if (newProgress < 99) {
        // Don't randomize at the very end
        newProgress += Math.random() * 5 - 2.5; // Add/subtract up to 2.5%
        newProgress = Math.max(0, Math.min(100, newProgress)); // Keep it within 0-100
      }

      setProgress(Math.floor(newProgress));

      if (newProgress >= 100) {
        clearInterval(interval);
        onComplete();
      }
    };

    interval = setInterval(updateProgress, 100 + Math.random() * 100); // Update every 100-200ms

    return () => clearInterval(interval); // Cleanup on unmount
  }, [onComplete, minLoadTime, maxLoadTime]);

  return (
    <>
      <h2 className={styles.loadingBarTitle}>Initializing Battlefield...</h2>
      <div className={styles.loadingBarContainer}>
        <div
          className={styles.loadingBarProgress}
          style={{ width: `${progress}%` }}
        ></div>
        <div className={styles.loadingBarText}>{progress}% Loaded</div>
      </div>
    </>
  );
};

export default LoadingBar;
