import { FormEvent, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiPost } from "../api/client";

type RegisterForm = {
  email: string;
  full_name: string;
  password: string;
};

type RegisterResponse = {
  id: string;
  email: string;
};

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({ email: "", full_name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = { ...form };
      await apiPost<RegisterForm, RegisterResponse>("/auth/register", payload);
      setSuccess("Account created. You can sign in now.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setError("Registration failed. Email might already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={containerStyle}>
      <section style={cardStyle}>
        <p style={{ letterSpacing: "0.35em", fontSize: "0.8rem", opacity: 0.7 }}>CREATE ACCESS</p>
        <h1 style={{ margin: "0.5rem 0 1.5rem", fontSize: "2.5rem" }}>Join the portal</h1>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
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
            Full name
            <input
              style={inputStyle}
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
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
              minLength={8}
              required
            />
          </label>
          {error && <p style={{ color: "#f87171", margin: 0 }}>{error}</p>}
          {success && <p style={{ color: "#34d399", margin: 0 }}>{success}</p>}
          <button style={buttonStyle} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p style={{ marginTop: "1.5rem", opacity: 0.8 }}>
          Already registered? <Link style={{ color: "#a5b4fc" }} to="/login">Log in</Link>.
        </p>
      </section>
    </main>
  );
};

const containerStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "radial-gradient(circle at top, #1f2937, #030712)",
  color: "#f8fafc",
  padding: "2rem",
};

const cardStyle: CSSProperties = {
  width: "min(440px, 100%)",
  padding: "2.5rem",
  borderRadius: "30px",
  background: "rgba(15, 23, 42, 0.95)",
  boxShadow: "0 30px 65px rgba(2, 6, 23, 0.55)",
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
  border: "1px solid rgba(248, 250, 252, 0.2)",
  background: "rgba(2, 6, 23, 0.6)",
  color: "#f8fafc",
};

const buttonStyle: CSSProperties = {
  width: "100%",
  padding: "0.95rem 1.2rem",
  borderRadius: "18px",
  border: "none",
  fontWeight: 600,
  fontSize: "1rem",
  background: "linear-gradient(120deg, #34d399, #10b981)",
  color: "#022c22",
  cursor: "pointer",
};

export default Register;
