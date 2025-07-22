// import clsx from "clsx";

import { useState } from "react";

import Canvas from "../Canvas/Canvas";

import BattleshipsCanvas from "./BattleshipsCanvas/BattleshipsCanvas";
import GridCanvas from "./GridCanvas/GridCanvas";
import HighlightCanvas from "./HighlightCanvas/HighlightCanvas";
import ShipsCanvas from "./ShipsCanvas/ShipsCanvas";

// import { DragDropContext } from "@hello-pangea/dnd";

import styles from "./CanvasWrapper.module.css";

const CanvasWrapper = () => {
  // const onDragEnd = useCallback(() => {
  //   // the only one that is required
  // }, []);

  const [ships, setShips] = useState([]);

  const drawShips = (shipss) => { //uueneb siis kui dragimis lõpetan
    // console.log("shipss", shipss);
    setShips(shipss);
    // console.log("ships", shipss);
  };

  return (
    // <DragDropContext onDragEnd={onDragEnd}>
    <div>
      {/* <Canvas isGrid id="coordinate-numbers" className="grid" height={50} /> */}
      {/* <Canvas isGrid id="coordinate-numbers" className="grid" width={50} /> */}
      <div className={styles.playgroundContainer}>
        {/*
        
        
        
        <Canvas
          isGrid
          id="coordinates"
          isCoordinates
          isPlayground
          startingPoint={50}
          pink
          className="grid"
          width={550}
          height={550}
        />
        <Canvas isGrid id="playground" isPlayground blue className="grid" />
        <Canvas isGrid id="ships" isPlayground isShips blue shipp className="grid" setShips={drawShips} />
        <Canvas isHighlight id="highlight" isPlayground blue className="grid" />


      */}
        <GridCanvas
          id="coordinates"
          startingPoint={50}
          className="grid-canvas"
          width={550}
          height={550}
          gridCellSize={50}
        />
        <BattleshipsCanvas gridCellSize={50} id="ships" className="ships-canvas" setShips={drawShips} />
        {/* <ShipsCanvas id="ships" className="ships-canvas" setShips={drawShips} />
        <HighlightCanvas isHighlight id="highlight" isPlayground blue className="highlight-canvas" /> */}
      </div>
      {/* <Canvas isGrid id="shipyard" isShipyard height={400} className="grid" /> */}
      <button>Save ships</button>
    </div>
    // </DragDropContext>
  );
};

export default CanvasWrapper;
