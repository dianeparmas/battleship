import { createContext, useState, useLayoutEffect, useContext } from "react";

import {
  ThemeContextType,
  ThemeProviderProps,
} from "../types/ThemeContext.types";

import { CANVAS_SIZE, GRID_CELL_SIZE } from "../constants/canvasConstants";

import useWindowSize from "../hooks/useWindowSize";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [canvasSize, setCanvasSize] = useState(0);
  const { width } = useWindowSize();

  useLayoutEffect(() => {
    // const responsiveCanvasSize = width <= 550 ? width - 50 : CANVAS_SIZE.WIDTH_GRID;
    let responsiveCanvasSize;

    if (width <= 550) {
      // subtract 50 and round down to nearest multiple of 10
      const rawSize = width - 50;
      // responsiveCanvasSize = Math.floor(rawSize / 10) * 10;
      responsiveCanvasSize = Math.floor(rawSize / 11) * 11;
    } else {
      responsiveCanvasSize = CANVAS_SIZE.WIDTH_GRID;
    }
    setCanvasSize(responsiveCanvasSize);
    console.log("width in context", width, width <= 550, width - 50);
    console.log("canvasSize in context", canvasSize);
  }, []);

  const value = { canvasSize };

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
