import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import TeamsFrame from "./layout/TeamsFrame";
import PresencePage from "./features/presence/PresencePage";
import AdminDashboard from "./features/admin/AdminDashboard";
import LoginModal from "./components/LoginModal";
import ToastContainer from "./components/ToastContainer";
import { isAuthenticated } from "./features/auth/authService";
import { initializeTheme } from "./services/themeService";

export default function App() {
  useEffect(() => {
    initializeTheme();
  }, []);

  if (!isAuthenticated()) {
    return <LoginModal />;
  }

  return (
    <BrowserRouter>
      <TeamsFrame>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<PresencePage />} />
          <Route path="/presence" element={<PresencePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </TeamsFrame>
    </BrowserRouter>
  );
}
