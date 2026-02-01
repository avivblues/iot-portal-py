import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Skeleton from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-background text-muted-foreground", children: _jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx(Skeleton, { className: "h-12 w-12 rounded-full" }), _jsx("p", { className: "text-sm", children: "Authenticating\u2026" })] }) }));
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location } });
    }
    return _jsx(Outlet, {});
};
export default ProtectedRoute;
