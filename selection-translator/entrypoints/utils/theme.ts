/**
 * ui theme
 * auto judge dark or light mode
 */
import { createTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useMemo } from "react";

export const createAppTheme = (isDark: boolean) =>
  createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
    },
    typography: {
      body1: {
        fontSize: "16px",
      },
    },
  });

export const useAppTheme = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () => createAppTheme(prefersDarkMode),
    [prefersDarkMode]
  );

  return theme;
};
