import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useTheme } from "../context/ThemeContext";

function AppHeader({ breadcrumb }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          maxWidth: "80rem",
          width: "100%",
          mx: "auto",
          px: { xs: 2, sm: 3, lg: 4 },
        }}
      >
        {/* Logo + breadcrumb */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
          <Box
            component="button"
            onClick={() => navigate("/dashboard")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              background: "none",
              border: "none",
              cursor: "pointer",
              p: 0,
              "&:hover": { opacity: 0.8 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                height: 36,
                width: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2.5,
                bgcolor: "primary.main",
              }}
            >
              <MenuBookIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "text.primary",
                fontSize: "1.25rem",
              }}
            >
              ClassOps
            </Typography>
          </Box>

          {breadcrumb && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ChevronRightIcon sx={{ fontSize: 16, color: "text.disabled" }} />
              <Typography
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: 500,
                  color: "text.secondary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: { xs: 200, sm: 320 },
                }}
              >
                {breadcrumb}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right side */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          <Button
            onClick={handleLogout}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover", color: "text.primary" },
            }}
          >
            Log out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

AppHeader.propTypes = {
  breadcrumb: PropTypes.string,
};

AppHeader.defaultProps = {
  breadcrumb: "",
};

export default AppHeader;
