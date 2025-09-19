import Game from "./components/Game/Game";

import styles from "./App.module.css";

function App() {
  return (
    <>
      <h1>Battleship</h1>
      <div className={styles.gameContainer}>
        <Game />
      </div>
    </>
  );
}

export default App;
