import { ThemeProvider } from "./contexts/ThemeContext";

import Game from "./components/Game/Game";

import styles from "./App.module.css";

function App() {
  return (
    <ThemeProvider>
      <>
        <h1>Battleship</h1>
        <div className={styles.gameContainer}>
          <Game />
        </div>
      </>
    </ThemeProvider>
  );
}

export default App;
