/**
 * useTheme.js
 *
 * No functional changes — updated import path to match ThemeContext
 * which now exports ThemeContext as a named export.
 */

import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "[useTheme] must be called inside <ThemeProvider>. " +
        "Make sure ThemeProvider is the outermost wrapper in main.jsx.",
    );
  }

  return context;
};

export default useTheme;
