import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import EmailIcon from "@mui/icons-material/Email";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../api/api";

function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [inviteInfo, setInviteInfo] = useState(null);
  const [error, setError] = useState("");

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    async function fetchInfo() {
      try {
        const res = await api.get(`/invite-info/${token}`);
        setInviteInfo(res.data);

        if (res.data.status === "ACCEPTED") {
          setStatus("already_accepted");
          return;
        }

        if (isLoggedIn) {
          setStatus("ready");
        } else {
          setStatus("need_login");
        }
      } catch {
        setStatus("invalid");
      }
    }
    fetchInfo();
  }, [token, isLoggedIn]);

  const handleAccept = async () => {
    setStatus("accepting");
    try {
      const res = await api.post(`/accept-invite/${token}`);
      setStatus("success");
      setTimeout(() => navigate(`/classes/${res.data.classId}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept invite");
      setStatus("error");
    }
  };

  const iconBoxSx = (bgColor) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    borderRadius: "50%",
    bgcolor: bgColor,
  });

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 448,
          borderRadius: 4,
          border: 1,
          borderColor: "divider",
          p: 4,
          textAlign: "center",
        }}
      >
        {status === "loading" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <CircularProgress size={32} />
            <Typography color="text.secondary">Loading invite...</Typography>
          </Box>
        )}

        {status === "invalid" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={iconBoxSx("rgba(239,68,68,0.1)")}>
              <CloseIcon sx={{ fontSize: 28, color: "error.main" }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Invalid Invite
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This invite link is invalid or has expired.
            </Typography>
            <Button
              component={Link}
              to="/dashboard"
              size="small"
              sx={{ mt: 1, color: "primary.main" }}
            >
              Go to Dashboard
            </Button>
          </Box>
        )}

        {status === "already_accepted" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={iconBoxSx("rgba(234,179,8,0.1)")}>
              <InfoIcon sx={{ fontSize: 28, color: "warning.main" }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Already Accepted
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This invite has already been used.
            </Typography>
            <Button
              component={Link}
              to="/dashboard"
              size="small"
              sx={{ mt: 1, color: "primary.main" }}
            >
              Go to Dashboard
            </Button>
          </Box>
        )}

        {status === "need_login" && inviteInfo && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={iconBoxSx("rgba(124,58,237,0.1)")}>
              <EmailIcon sx={{ fontSize: 28, color: "primary.main" }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Class Invitation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Box
                component="span"
                sx={{ fontWeight: 500, color: "primary.light" }}
              >
                {inviteInfo.invitedBy}
              </Box>{" "}
              invited you to join
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {inviteInfo.classTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in or create an account to accept this invite.
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
              <Button
                component={Link}
                to={`/login?redirect=/invite/${token}`}
                variant="contained"
                size="small"
              >
                Sign In
              </Button>
              <Button
                component={Link}
                to={`/signup?redirect=/invite/${token}`}
                variant="outlined"
                size="small"
              >
                Sign Up
              </Button>
            </Box>
          </Box>
        )}

        {status === "ready" && inviteInfo && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={iconBoxSx("rgba(124,58,237,0.1)")}>
              <PersonAddIcon sx={{ fontSize: 28, color: "primary.main" }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Class Invitation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Box
                component="span"
                sx={{ fontWeight: 500, color: "primary.light" }}
              >
                {inviteInfo.invitedBy}
              </Box>{" "}
              invited you to join
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {inviteInfo.classTitle}
            </Typography>
            <Button onClick={handleAccept} variant="contained" sx={{ mt: 1 }}>
              Accept & Join Class
            </Button>
          </Box>
        )}

        {status === "accepting" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <CircularProgress size={32} />
            <Typography color="text.secondary">Joining class...</Typography>
          </Box>
        )}

        {status === "success" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={iconBoxSx("rgba(34,197,94,0.1)")}>
              <CheckCircleIcon sx={{ fontSize: 28, color: "success.main" }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Joined Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to class...
            </Typography>
          </Box>
        )}

        {status === "error" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={iconBoxSx("rgba(239,68,68,0.1)")}>
              <CloseIcon sx={{ fontSize: 28, color: "error.main" }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Failed to Join
            </Typography>
            <Typography variant="body2" color="error.light">
              {error}
            </Typography>
            <Button
              component={Link}
              to="/dashboard"
              size="small"
              sx={{ mt: 1, color: "primary.main" }}
            >
              Go to Dashboard
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default AcceptInvite;
