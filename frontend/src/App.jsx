import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ClassPage from "./pages/ClassPage";
import AssignmentDetails from "./pages/AssignmentDetails";
import DocumentViewer from "./pages/DocumentViewer";
import AcceptInvite from "./pages/AcceptInvite";
import ChatBubble from "./components/ChatBubble";
import AIChat from "./components/AIChat";
import "./App.css";

// Routes where chatbot should not appear
const AUTH_ROUTES = ["/login", "/signup", "/verify-email", "/forgot-password", "/reset-password"];

function ChatContainer() {
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);

  // Hide chat on auth pages
  const showChat = !AUTH_ROUTES.some((route) => location.pathname.startsWith(route));

  return (
    <>
      {showChat && (
        <>
          <ChatBubble onClick={() => setChatOpen(!chatOpen)} open={chatOpen} />
          <AIChat open={chatOpen} onClose={() => setChatOpen(false)} />
        </>
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ChatContainer />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/classes/:id" element={<ClassPage />} />
          <Route
            path="/classes/:classId/assignments/:assignmentId"
            element={<AssignmentDetails />}
          />
          <Route path="/documents/:id" element={<DocumentViewer />} />
          <Route path="/invite/:token" element={<AcceptInvite />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
