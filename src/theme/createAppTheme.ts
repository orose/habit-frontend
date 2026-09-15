import { createTheme, type PaletteMode, type Theme } from "@mui/material";
import { brand, darkPalette, lightPalette, radius, semantic } from "./tokens";

/**
 * Builds the app's MUI theme from the raw tokens for a given light/dark
 * mode. See useAppTheme.ts for how the mode itself is resolved from the
 * device's `prefers-color-scheme` setting.
 */
export function createAppTheme(mode: PaletteMode): Theme {
  const surface = mode === "light" ? lightPalette : darkPalette;

  return createTheme({
    palette: {
      mode,
      primary: { main: brand.main, light: brand.light, dark: brand.dark },
      success: { main: semantic.success },
      warning: { main: semantic.warning },
      error: { main: semantic.error },
      background: { default: surface.background, paper: surface.surface },
      text: { primary: surface.textPrimary, secondary: surface.textSecondary },
      divider: surface.divider,
    },
    shape: { borderRadius: radius.md },
    typography: {
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      h4: { fontWeight: 700 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: radius.sm, textTransform: "none" } },
      },
      MuiPaper: {
        styleOverrides: { root: { borderRadius: radius.lg } },
      },
    },
  });
}
