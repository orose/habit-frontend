/**
 * Raw design tokens - the single source of truth for colors used to build
 * the MUI theme (see createAppTheme.ts). Kept separate from the MUI-specific
 * theme shape so the palette can be swapped without touching component code.
 */

export const brand = {
  main: "#2E7D5B",
  light: "#4F9E7C",
  dark: "#1E5A3E",
};

export const neutral = {
  50: "#FAFAF9",
  100: "#F0EFEC",
  200: "#E1DFDA",
  300: "#C7C4BC",
  400: "#9C9890",
  500: "#726F68",
  600: "#57544E",
  700: "#403E39",
  800: "#2A2926",
  900: "#171613",
};

export const semantic = {
  success: "#2E7D5B",
  warning: "#B8860B",
  error: "#C13B3B",
};

export const lightPalette = {
  mode: "light" as const,
  background: neutral[50],
  surface: "#FFFFFF",
  textPrimary: neutral[900],
  textSecondary: neutral[600],
  divider: neutral[200],
};

export const darkPalette = {
  mode: "dark" as const,
  background: neutral[900],
  surface: neutral[800],
  textPrimary: neutral[50],
  textSecondary: neutral[300],
  divider: neutral[700],
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
};
