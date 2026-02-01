import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../api/client";
import AuthLayout from "../components/AuthLayout";
import ErrorState from "../components/ErrorState";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();
    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await apiPost("/auth/register", {
                email,
                password,
                full_name: fullName,
            });
            await loginWithToken(data.access_token);
            navigate("/dashboard", { replace: true });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Unable to create workspace");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(AuthLayout, { title: "Create an account", subtitle: "Provision a tenant to orchestrate assets, alerts, and automations", footer: _jsxs("p", { children: ["Already onboarded? ", _jsx(Link, { className: "text-primary", to: "/login", children: "Sign in" })] }), children: [_jsxs("form", { className: "space-y-5", onSubmit: submit, children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "fullName", children: "Full name" }), _jsx(Input, { id: "fullName", type: "text", autoComplete: "name", value: fullName, onChange: (e) => setFullName(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Work email" }), _jsx(Input, { id: "email", type: "email", autoComplete: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, { id: "password", type: "password", autoComplete: "new-password", required: true, value: password, onChange: (e) => setPassword(e.target.value) })] }), _jsx(Button, { className: "w-full", disabled: loading, type: "submit", children: loading ? "Creating…" : "Create workspace" })] }), error && (_jsx("div", { className: "mt-6", children: _jsx(ErrorState, { description: error, actionLabel: "Try again", onAction: () => setError(null) }) }))] }));
};
export default Register;
