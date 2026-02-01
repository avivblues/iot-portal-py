import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(ProtectedRoute, {}), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/devices", element: _jsx(Devices, {}) }), _jsx(Route, { path: "/automations", element: _jsx(Automations, {}) }), _jsx(Route, { path: "/alerts", element: _jsx(Alerts, {}) })] }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] }));
};
export default App;
