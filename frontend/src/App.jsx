import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import "./App.css";

function App() {
  return (
    <BrowserRouter>
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
  );
}

export default App;
