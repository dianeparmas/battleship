import { useState } from "react";

import "./App.css";

import CanvasWrapper from "./components/CanvasWrapper/CanvasWrapper";

function App() {
  const [count, setCount] = useState(0);

  const test = false;

  return (
    <>
      <h1>Vite + React + tsx</h1>
      <CanvasWrapper />
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
