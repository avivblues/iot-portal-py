import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiGet, clearToken, getToken } from "../api/client";

type UserProfile = {
  id: string;
  email: string | null;
  display_name: string;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let isMounted = true;
    apiGet<UserProfile>("/me", token)
      .then((data) => {
        if (isMounted) {
          setProfile(data);
        }
      })
      .catch(() => {
        clearToken();
        setError("Your session expired. Please sign in again.");
        navigate("/login", { replace: true });
      });

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  if (!profile || error) {
    return (
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Space Grotesk', 'Helvetica Neue', sans-serif"
        }}
      >
        <p>{error ?? "Loading your profile…"}</p>
      </section>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020617",
        color: "#f8fafc",
        fontFamily: "'Space Grotesk', 'Helvetica Neue', sans-serif"
      }}
    >
      <article
        style={{
          background: "#0f172a",
          padding: "2.5rem",
          borderRadius: "24px",
          width: "min(520px, 90vw)",
          boxShadow: "0 25px 70px rgba(2, 6, 23, 0.65)"
        }}
      >
        <header style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              style={{ width: "80px", height: "80px", borderRadius: "20px", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                background: "#1d2a55",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                fontWeight: 600
              }}
            >
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p style={{ opacity: 0.6, letterSpacing: "0.3em", fontSize: "0.75rem" }}>SIGNED IN</p>
            <h1 style={{ fontSize: "2.25rem", margin: 0 }}>{profile.display_name}</h1>
            <p style={{ opacity: 0.8 }}>{profile.email ?? "No email provided"}</p>
          </div>
        </header>
        <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.75rem 1.5rem", margin: 0 }}>
          <dt style={{ opacity: 0.6 }}>User ID</dt>
          <dd style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>{profile.id}</dd>
          <dt style={{ opacity: 0.6 }}>Created</dt>
          <dd style={{ margin: 0 }}>{profile.created_at ?? "—"}</dd>
          <dt style={{ opacity: 0.6 }}>Updated</dt>
          <dd style={{ margin: 0 }}>{profile.updated_at ?? "—"}</dd>
        </dl>
      </article>
    </main>
  );
};

export default Dashboard;
