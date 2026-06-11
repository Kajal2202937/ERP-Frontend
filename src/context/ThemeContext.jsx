import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  getTheme,
  toggle,
  setTheme as storeSetTheme,
  subscribe,
} from "../theme/theme.store";

export const ThemeContext = createContext(null);

const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getTheme);

  useEffect(() => {
    return subscribe(setThemeState);
  }, []);

  const toggleTheme = useCallback(() => {
    toggle();
  }, []);

  const setThemeFn = useCallback((t) => {
    storeSetTheme(t);
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme: setThemeFn }),
    [theme, toggleTheme, setThemeFn],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeProvider;
