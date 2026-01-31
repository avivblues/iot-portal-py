import { FormEvent, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiPost, saveToken } from "../api/client";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
};

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiPost<LoginRequest, LoginResponse>("/auth/login", form);
      saveToken(response.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={containerStyle}>
      <section style={heroColumnStyle}>
        <p style={{ letterSpacing: "0.4em", fontSize: "0.85rem", opacity: 0.7 }}>IOT PORTAL</p>
        <h1 style={{ fontSize: "3rem", margin: "1rem 0" }}>
          Secure access to your devices, wherever they live.
        </h1>
        <p style={{ opacity: 0.8 }}>
          Use your email and password to enter the control room. JWT-backed sessions keep things tight.
        </p>
      </section>
      <section style={cardStyle}>
        <h2 style={{ marginBottom: "0.5rem" }}>Welcome back</h2>
        <p style={{ marginTop: 0, opacity: 0.75 }}>Sign in to reach the dashboard.</p>
        <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem", display: "grid", gap: "0.75rem" }}>
          <label style={labelStyle}>
            Email
            <input
              style={inputStyle}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label style={labelStyle}>
            Password
            <input
              style={inputStyle}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>
          {error && <p style={{ color: "#f87171", margin: 0 }}>{error}</p>}
          <button style={buttonStyle} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p style={{ marginTop: "1.5rem", textAlign: "center", opacity: 0.8 }}>
          Need an account? <Link style={{ color: "#38bdf8" }} to="/register">Create one</Link>.
        </p>
      </section>
    </main>
  );
};

const containerStyle: CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "3rem",
  alignItems: "center",
  padding: "3rem",
  background: "linear-gradient(135deg, #010c1c, #061838)",
  color: "#e2e8f0",
};

const heroColumnStyle: CSSProperties = {
  maxWidth: "520px",
  justifySelf: "center",
};

const cardStyle: CSSProperties = {
  width: "min(420px, 100%)",
  justifySelf: "center",
  padding: "2rem",
  borderRadius: "24px",
  background: "rgba(15, 23, 42, 0.85)",
  boxShadow: "0 25px 60px rgba(2, 6, 23, 0.65)",
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: "0.3rem",
  fontWeight: 600,
  fontSize: "0.9rem",
};

const inputStyle: CSSProperties = {
  padding: "0.85rem 1rem",
  borderRadius: "12px",
  border: "1px solid rgba(226, 232, 240, 0.4)",
  background: "rgba(15, 23, 42, 0.65)",
  color: "#e2e8f0",
};

const buttonStyle: CSSProperties = {
  width: "100%",
  padding: "0.9rem 1.2rem",
  borderRadius: "999px",
  border: "none",
  fontWeight: 600,
  fontSize: "1rem",
  background: "linear-gradient(120deg, #38bdf8, #6366f1)",
  color: "#0f172a",
  cursor: "pointer",
};

export default Login;
