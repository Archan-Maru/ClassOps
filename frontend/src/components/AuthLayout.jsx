import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useTheme } from "../context/ThemeContext";

function AuthLayout({ title, subtitle, children, footer }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
      }}
    >
      {/* -- Left panel - branding -- */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          width: { lg: "41.666%", xl: "40%" },
          flexDirection: "column",
          justifyContent: "center",
          px: 8,
          bgcolor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
        }}
      >
        {/* Logo mark */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2.5,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MenuBookIcon sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "text.primary",
              letterSpacing: "-0.025em",
            }}
          >
            ClassOps
          </Typography>
        </Box>

        {/* Tagline */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            lineHeight: 1.3,
            mb: 2,
          }}
        >
          All your classes.
          <br />
          One simple platform.
        </Typography>
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "1rem",
            lineHeight: 1.6,
            maxWidth: 320,
          }}
        >
          Manage assignments, submissions, and grades — all in one calm,
          organised space.
        </Typography>
      </Box>

      {/* -- Right panel - form -- */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
          py: 6,
          bgcolor: "background.default",
          position: "relative",
        }}
      >
        {/* Theme toggle - top right */}
        <Box sx={{ position: "absolute", top: 16, right: 16 }}>
          <IconButton
            onClick={toggleTheme}
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            sx={{ color: "text.secondary" }}
          >
            {theme === "dark" ? (
              <LightModeIcon fontSize="small" />
            ) : (
              <DarkModeIcon fontSize="small" />
            )}
          </IconButton>
        </Box>

        {/* Mobile logo */}
        <Box
          sx={{
            display: { xs: "flex", lg: "none" },
            alignItems: "center",
            gap: 1,
            mb: 4,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2.5,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MenuBookIcon sx={{ color: "#fff", fontSize: 16 }} />
          </Box>
          <Typography
            sx={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            ClassOps
          </Typography>
        </Box>

        {/* Card */}
        <Paper
          variant="outlined"
          sx={{
            width: "100%",
            maxWidth: 448,
            borderRadius: 4,
            px: 4,
            py: 5,
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          {children}

          {footer && (
            <Box
              sx={{
                mt: 3,
                textAlign: "center",
                fontSize: "0.875rem",
                color: "text.secondary",
              }}
            >
              {footer}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

export default AuthLayout;
