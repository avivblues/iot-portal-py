import { Navigate, Route, Routes } from "react-router-dom";

import Alerts from "./pages/Alerts";
import Automations from "./pages/Automations";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is required for the frontend to contact the API");
  }

  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/automations" element={<Automations />} />
        <Route path="/alerts" element={<Alerts />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
