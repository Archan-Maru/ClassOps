import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Collapse,
  Divider,
  Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useTheme } from "@mui/material/styles";

function AIChat({ open, onClose }) {
  const theme = useTheme();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hey! 👋 I'm your AI learning assistant. I can help you:\n📄 Summarize documents (PDF, PPT)\n📖 Explain topics & concepts\n🎯 Generate quizzes for practice\n\nUpload a file or ask me anything!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Please upload PDF, PowerPoint, or text files only");
      return;
    }

    setUploadedFile(file);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !uploadedFile) return;

    let messageContent = input;

    // If file is uploaded, add file info to message
    if (uploadedFile) {
      messageContent = `[File: ${uploadedFile.name}]\n${input || "Please analyze and summarize this document."}`;
    }

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: messageContent,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setUploadedFile(null);
    setLoading(true);

    try {
      // Prepare formData for file upload
      const formData = new FormData();
      formData.append("message", input || "Please analyze this document");
      if (uploadedFile) {
        formData.append("file", uploadedFile);
      }
      formData.append(
        "conversationHistory",
        JSON.stringify(
          messages
            .filter((m) => m.type !== "typing")
            .map((m) => ({
              role: m.type === "user" ? "user" : "assistant",
              content: m.content,
            }))
        )
      );

      // Call backend API which uses Groq
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/ai/chat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const botMessage = {
        id: messages.length + 2,
        type: "bot",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        type: "bot",
        content:
          "Sorry, I encountered an error. Please try again or check your connection.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <Collapse in={open} timeout="auto">
      <Paper
        sx={{
          position: "fixed",
          bottom: 80,
          right: 20,
          width: { xs: "calc(100% - 40px)", sm: 380 },
          maxHeight: 500,
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 5px 40px rgba(0, 188, 212, 0.3)",
          borderRadius: 2,
          zIndex: 1200,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
            color: "white",
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
              🤖 AI Learning Assistant
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.75rem" }}>
              Powered by Groq • Upload docs & ask questions
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: "white",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            minHeight: 300,
            backgroundColor:
              theme.palette.mode === "dark" ? "#0f0f0f" : "#f5f5f5",
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: "flex",
                justifyContent:
                  message.type === "user" ? "flex-end" : "flex-start",
              }}
            >
              <Paper
                sx={{
                  maxWidth: "80%",
                  p: 1.5,
                  backgroundColor:
                    message.type === "user"
                      ? "#00BCD4"
                      : theme.palette.mode === "dark"
                        ? "#1f1f1f"
                        : "#e0f7fa",
                  color: message.type === "user" ? "white" : "inherit",
                  borderRadius: 2,
                  wordWrap: "break-word",
                  boxShadow:
                    message.type === "user"
                      ? "0 2px 8px rgba(0, 188, 212, 0.3)"
                      : "0 1px 3px rgba(0,0,0,0.1)",
                  border:
                    message.type === "user"
                      ? "none"
                      : `1px solid ${theme.palette.divider}`,
                }}
                elevation={0}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                  {message.content}
                </Typography>
              </Paper>
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Paper
                sx={{
                  p: 1.5,
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#1f1f1f" : "#e0f7fa",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  border:
                    theme.palette.mode === "dark"
                      ? "1px solid #333"
                      : "1px solid #b3e5fc",
                }}
                elevation={0}
              >
                <CircularProgress size={20} sx={{ color: "#00BCD4" }} />
                <Typography variant="body2">Analyzing...</Typography>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* File Display */}
        {uploadedFile && (
          <Box
            sx={{
              px: 2,
              pt: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Chip
              icon={<AttachFileIcon />}
              label={uploadedFile.name}
              onDelete={() => setUploadedFile(null)}
              size="small"
              sx={{
                backgroundColor: "rgba(0, 188, 212, 0.1)",
                color: "#00BCD4",
                border: "1px solid #00BCD4",
              }}
            />
          </Box>
        )}

        {/* Input Area */}
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            backgroundColor: theme.palette.background.paper,
            borderRadius: "0 0 8px 8px",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              multiline
              maxRows={2}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#1a1a1a" : "#f5f5f5",
                  border: uploadedFile ? "2px solid #00BCD4" : "1px solid",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "#00BCD4",
                  },
                },
              }}
            />
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.pptx,.ppt,.txt"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                sx={{
                  color: uploadedFile ? "#00BCD4" : "inherit",
                  border: uploadedFile ? "2px solid #00BCD4" : "1px solid",
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "rgba(0, 188, 212, 0.1)",
                    borderColor: "#00BCD4",
                    color: "#00BCD4",
                  },
                }}
                title="Upload PDF, PowerPoint or text file"
              >
                <AttachFileIcon fontSize="small" />
              </IconButton>
              <IconButton
                type="submit"
                disabled={loading || (!input.trim() && !uploadedFile)}
                sx={{
                  backgroundColor: "#00BCD4",
                  color: "white",
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "#0097A7",
                    transform: "scale(1.05)",
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                  "&:disabled": {
                    backgroundColor: theme.palette.action.disabled,
                    color: theme.palette.text.disabled,
                  },
                  transition: "all 0.2s",
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Collapse>
  );
}

export default AIChat;
