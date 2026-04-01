import { IconButton, Tooltip, Box } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";

function ChatBubble({ onClick, open }) {
  return (
    <Tooltip
      title={open ? "Close chat" : "Chat with AI Assistant"}
      arrow
      placement="left"
    >
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1199,
        }}
      >
        <IconButton
          onClick={onClick}
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
            color: "white",
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
              boxShadow: "0 6px 20px rgba(124, 58, 237, 0.6)",
            },
            "&:active": {
              transform: "scale(0.95)",
            },
          }}
        >
          <SmartToyIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>
    </Tooltip>
  );
}

export default ChatBubble;
