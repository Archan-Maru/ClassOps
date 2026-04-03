import { createTheme } from "@mui/material/styles";

/**
 * ClassOps Minimal Design System
 *
 * Inspired by Notion, Linear — calm, premium, minimal.
 *
 * DESIGN PRINCIPLES:
 * - Neutral color palette (grays, whites)
 * - Single soft accent (indigo)
 * - No gradients, no bright colors
 * - Subtle borders and shadows
 * - Clean typography
 */

// Minimal color tokens
export const colorTokens = {
  light: {
    background: {
      default: "#fafafa",
      paper: "#ffffff",
      subtle: "#f5f5f5",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#6b6b6b",
      tertiary: "#9a9a9a",
    },
    border: {
      default: "#e5e5e5",
      subtle: "#f0f0f0",
      hover: "#d4d4d4",
    },
    accent: {
      main: "#4f46e5", // Soft indigo
      light: "#eef2ff",
      hover: "#4338ca",
    },
  },
  dark: {
    background: {
      default: "#0a0a0a",
      paper: "#141414",
      subtle: "#1a1a1a",
    },
    text: {
      primary: "#fafafa",
      secondary: "#a1a1a1",
      tertiary: "#6b6b6b",
    },
    border: {
      default: "#262626",
      subtle: "#1f1f1f",
      hover: "#3a3a3a",
    },
    accent: {
      main: "#818cf8", // Lighter indigo for dark mode
      light: "#1e1b4b",
      hover: "#6366f1",
    },
  },
};

/**
 * Build a minimal MUI theme
 * @param {"light"|"dark"} mode
 */
export function buildTheme(mode) {
  const isDark = mode === "dark";
  const tokens = isDark ? colorTokens.dark : colorTokens.light;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: tokens.accent.main,
        light: tokens.accent.light,
        dark: tokens.accent.hover,
        contrastText: "#ffffff",
      },
      error: {
        main: isDark ? "#f87171" : "#dc2626",
        light: isDark ? "#1f1215" : "#fef2f2",
      },
      warning: {
        main: isDark ? "#fbbf24" : "#d97706",
        light: isDark ? "#1f1a0f" : "#fffbeb",
      },
      success: {
        main: isDark ? "#4ade80" : "#16a34a",
        light: isDark ? "#0f1f15" : "#f0fdf4",
      },
      background: {
        default: tokens.background.default,
        paper: tokens.background.paper,
      },
      text: {
        primary: tokens.text.primary,
        secondary: tokens.text.secondary,
        disabled: tokens.text.tertiary,
      },
      divider: tokens.border.default,
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
    typography: {
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
      ].join(","),
      h1: {
        fontSize: "1.875rem",
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontSize: "1.5rem",
        fontWeight: 600,
        lineHeight: 1.35,
        letterSpacing: "-0.01em",
      },
      h3: {
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: "1.125rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: "1rem",
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: "0.875rem",
        fontWeight: 600,
        lineHeight: 1.5,
      },
      subtitle1: {
        fontSize: "0.9375rem",
        fontWeight: 500,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: "0.8125rem",
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: "0.9375rem",
        lineHeight: 1.6,
      },
      body2: {
        fontSize: "0.8125rem",
        lineHeight: 1.5,
      },
      caption: {
        fontSize: "0.75rem",
        lineHeight: 1.5,
        color: tokens.text.secondary,
      },
      button: {
        fontSize: "0.8125rem",
        fontWeight: 500,
        textTransform: "none",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: tokens.background.default,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
            fontWeight: 500,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
          outlined: {
            borderColor: tokens.border.default,
            "&:hover": {
              borderColor: tokens.border.hover,
              backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            },
          },
        },
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: 12,
          },
        },
        defaultProps: {
          elevation: 0,
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${tokens.border.default}`,
            boxShadow: "none",
          },
        },
        defaultProps: {
          elevation: 0,
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
            fontSize: "0.75rem",
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: tokens.border.subtle,
          },
        },
      },
    },
  });
}
