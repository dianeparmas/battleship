import { createContext, useState, useLayoutEffect, useContext } from "react";

import {
  ThemeContextType,
  ThemeProviderProps,
} from "../types/ThemeContext.types";

import { CANVAS_SIZE } from "../constants/canvasConstants";

import useWindowSize from "../hooks/useWindowSize";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [canvasSize, setCanvasSize] = useState(0);
  const [gridCanvasSize, setGridCanvasSize] = useState(0);
  const [cellSize, setCellSize] = useState(0);
  const { width } = useWindowSize();

  useLayoutEffect(() => {
    let responsiveCanvasSize;
    const requiredCells = 11;

    if (width <= 550) {
      responsiveCanvasSize = Math.floor(width / 11) * 11;
      const multiples = [550, 440, 330, 220, 110];
      responsiveCanvasSize =
        multiples.find((size) => size <= width) ||
        multiples[multiples.length - 1];
    } else {
      responsiveCanvasSize = CANVAS_SIZE.WIDTH_GRID;
    }
    const gridCellSize = responsiveCanvasSize / requiredCells;

    setCellSize(gridCellSize);
    setGridCanvasSize(responsiveCanvasSize);
    setCanvasSize(responsiveCanvasSize - gridCellSize);
  }, [width]);

  const value = { cellSize, canvasSize, gridCanvasSize };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
