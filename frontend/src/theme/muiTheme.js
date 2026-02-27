import { createTheme } from "@mui/material/styles";

/**
 * Build an MUI theme that mirrors the existing Tailwind colour scheme.
 * @param {"light"|"dark"} mode
 */
export function buildTheme(mode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#7c3aed", // violet-600
        light: "#a78bfa", // violet-400
        dark: "#6d28d9", // violet-700
        contrastText: "#ffffff",
      },
      error: {
        main: isDark ? "#f87171" : "#dc2626",
        light: isDark ? "#fca5a5" : "#fee2e2",
        dark: "#b91c1c",
      },
      warning: {
        main: isDark ? "#fbbf24" : "#d97706",
        light: isDark ? "#fcd34d" : "#fef3c7",
      },
      success: {
        main: isDark ? "#4ade80" : "#16a34a",
        light: isDark ? "#86efac" : "#dcfce7",
      },
      background: {
        default: isDark ? "#09090b" : "#fafafa", // zinc-950 / zinc-50
        paper: isDark ? "#27272a" : "#ffffff", // zinc-800 / white
      },
      text: {
        primary: isDark ? "#f4f4f5" : "#18181b", // zinc-100 / zinc-900
        secondary: isDark ? "#a1a1aa" : "#71717a", // zinc-400 / zinc-500
      },
      divider: isDark ? "#3f3f46" : "#e4e4e7", // zinc-700 / zinc-200
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: "inherit",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? "#09090b" : "#fafafa",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 12,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none", // remove MUI's default gradient overlay in dark mode
          },
        },
      },
    },
  });
}
