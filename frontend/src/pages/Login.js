import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiPost } from "../api/client";
import AuthLayout from "../components/AuthLayout";
import ErrorState from "../components/ErrorState";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithToken } = useAuth();
    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await apiPost("/auth/login", { email, password });
            await loginWithToken(data.access_token);
            const redirectTo = location.state?.from?.pathname ?? "/dashboard";
            navigate(redirectTo, { replace: true });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Unable to sign in");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(AuthLayout, { title: "Welcome back", subtitle: "Authenticate to orchestrate devices, energy, and automation policies", footer: _jsxs("p", { children: ["Need an account? ", _jsx(Link, { className: "text-primary", to: "/register", children: "Create one" })] }), children: [_jsxs("form", { className: "space-y-5", onSubmit: submit, children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", autoComplete: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, { id: "password", type: "password", autoComplete: "current-password", required: true, value: password, onChange: (e) => setPassword(e.target.value) })] }), _jsx(Button, { className: "w-full", disabled: loading, type: "submit", children: loading ? "Signing in…" : "Sign in" })] }), error && (_jsx("div", { className: "mt-6", children: _jsx(ErrorState, { description: error, actionLabel: "Try again", onAction: () => setError(null) }) }))] }));
};
export default Login;
