import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

import { apiGet, clearToken, getToken } from "../api/client";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string | null;
  created_at: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    apiGet<UserProfile>("/auth/me", token)
      .then(setProfile)
      .catch(() => {
        clearToken();
        setError("Session expired. Please log in again.");
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  const handleLogout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  if (error) {
    return (
      <main style={containerStyle}>
        <section style={cardStyle}>
          <p>{error}</p>
          <button style={buttonStyle} onClick={() => navigate("/login", { replace: true })}>
            Back to Login
          </button>
        </section>
      </main>
    );
  }

  if (!profile) {
    return (
      <main style={containerStyle}>
        <section style={cardStyle}>
          <p>Loading your dashboard...</p>
        </section>
      </main>
    );
  }

  return (
    <main style={containerStyle}>
      <section style={cardStyle}>
        <p style={{ letterSpacing: "0.2em", fontSize: "0.75rem", opacity: 0.7 }}>AUTHENTICATED</p>
        <h1 style={{ marginBottom: "0.5rem" }}>{profile.full_name || "Unnamed User"}</h1>
        <p style={{ marginTop: 0, opacity: 0.8 }}>{profile.email}</p>
        <div style={{ marginTop: "1.5rem", fontFamily: "monospace", fontSize: "0.9rem" }}>
          <p>ID: {profile.id}</p>
          <p>Created: {new Date(profile.created_at).toLocaleString()}</p>
        </div>
        <button style={{ ...buttonStyle, marginTop: "2rem" }} onClick={handleLogout}>
          Log out
        </button>
      </section>
    </main>
  );
};

const containerStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#020617",
  color: "#f8fafc",
  padding: "2rem",
};

const cardStyle: CSSProperties = {
  width: "min(480px, 100%)",
  padding: "2.5rem",
  borderRadius: "24px",
  background: "#0f172a",
  boxShadow: "0 25px 60px rgba(2, 6, 23, 0.45)",
};

const buttonStyle: CSSProperties = {
  width: "100%",
  padding: "0.9rem 1.2rem",
  borderRadius: "999px",
  border: "none",
  fontWeight: 600,
  fontSize: "1rem",
  background: "#f87171",
  color: "#0f172a",
  cursor: "pointer",
};

export default Dashboard;
