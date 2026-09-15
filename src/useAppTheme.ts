import { useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import { createAppTheme } from "./theme";

/**
 * Resolves the app's MUI theme from the device's `prefers-color-scheme`
 * setting. `useMediaQuery` re-renders automatically whenever the OS setting
 * changes, so light/dark mode always follows the device without a manual
 * toggle in the UI.
 */
export function useAppTheme() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  return useMemo(
    () => createAppTheme(prefersDarkMode ? "dark" : "light"),
    [prefersDarkMode],
  );
}
