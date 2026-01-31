import { useState } from "react";

import { apiGet, getApiBaseUrl } from "../api/client";

type HealthResult = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
  requestUrl?: string;
};

const Login = () => {
  const [health, setHealth] = useState<HealthResult>({ status: "idle", message: "" });

  const checkHealth = async () => {
    let requestUrl: string | undefined;
    setHealth({ status: "loading", message: "Checking API health..." });
    try {
      const { data, requestUrl: resolvedUrl } = await apiGet<{ ok: boolean }>("/health");
      requestUrl = resolvedUrl;
      setHealth({
        status: "success",
        message: JSON.stringify(data, null, 2),
        requestUrl
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setHealth({ status: "error", message, requestUrl });
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
        background: "#0f172a",
        color: "#f8fafc",
        padding: "2rem"
      }}
    >
      <section
        style={{
          width: "min(420px, 100%)",
          padding: "2.5rem",
          borderRadius: "1.5rem",
          background: "#1e293b",
          boxShadow: "0 25px 50px rgba(2, 6, 23, 0.35)"
        }}
      >
        <p style={{ letterSpacing: "0.3em", fontSize: "0.75rem", opacity: 0.7 }}>IOT PORTAL</p>
        <h1 style={{ marginTop: "0.5rem", marginBottom: "1rem", fontSize: "2rem" }}>Login</h1>
        <p style={{ marginBottom: "1.5rem", opacity: 0.8 }}>
          Minimal R&D shell. Use the health check to verify API connectivity.
        </p>
        <button
          style={{
            width: "100%",
            padding: "0.9rem 1.2rem",
            borderRadius: "999px",
            border: "none",
            fontWeight: 600,
            fontSize: "1rem",
            background: "#22d3ee",
            color: "#0f172a",
            cursor: "pointer"
          }}
          onClick={checkHealth}
        >
          Check API Health
        </button>
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            borderRadius: "1rem",
            background: "#0f172a",
            fontSize: "0.9rem",
            wordBreak: "break-word"
          }}
        >
          <p style={{ margin: 0 }}>Resolved API base URL:</p>
          <p style={{ margin: "0.25rem 0", fontFamily: "monospace" }}>{getApiBaseUrl()}</p>
          {health.requestUrl && (
            <>
              <p style={{ margin: "0.75rem 0 0", opacity: 0.8 }}>Last request URL:</p>
              <p style={{ margin: "0.25rem 0", fontFamily: "monospace" }}>{health.requestUrl}</p>
            </>
          )}
          {health.status !== "idle" && (
            <>
              <p style={{ margin: "0.75rem 0 0", opacity: 0.8 }}>Status: {health.status}</p>
              <pre
                style={{
                  margin: "0.5rem 0 0",
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  background: "#020617",
                  whiteSpace: "pre-wrap"
                }}
              >
                {health.message}
              </pre>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Login;
