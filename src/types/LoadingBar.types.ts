export interface LoadingBarProps {
  onComplete: () => void; // Callback when loading is 100%
  minLoadTime?: number; // Minimum time in ms before completion
  maxLoadTime?: number; // Maximum time in ms before completion
}
