import { BrowserRouter, Routes, Route } from "react-router-dom";

import TeamsFrame from "./layout/TeamsFrame";
import PresencePage from "./pages/PresencePage";
import AdminDashboard from "./pages/AdminDashboard";
import ToastContainer from "./components/ToastContainer";

export default function App() {
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