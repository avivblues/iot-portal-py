import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { apiGet, buildApiUrl, getApiBaseUrl, providerUrl } from "../api/client";

const buttonStyle: CSSProperties = {
  padding: "0.85rem 1.25rem",
  borderRadius: "999px",
  border: "none",
  fontSize: "1rem",
  fontWeight: 600,
  cursor: "pointer",
  minWidth: "220px"
};

type HealthState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
  lastUrl?: string;
};

const Login = () => {
  const [resolvedBaseUrl, setResolvedBaseUrl] = useState<string>("");
  const [configError, setConfigError] = useState<string | null>(null);
  const [healthState, setHealthState] = useState<HealthState>({ status: "idle", message: "" });

  useEffect(() => {
    try {
      setResolvedBaseUrl(getApiBaseUrl());
      setConfigError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to resolve API base URL.";
      setConfigError(message);
      setResolvedBaseUrl("Unavailable");
    }
  }, []);

  const startOAuth = (provider: "google" | "facebook") => {
    window.location.href = providerUrl(provider);
  };

  const checkHealth = async () => {
    let requestUrl: string;
    try {
      requestUrl = buildApiUrl("/health");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to prepare health check request.";
      setConfigError(message);
      setHealthState({ status: "error", message });
      return;
    }

    setHealthState({ status: "loading", message: "Checking API health…", lastUrl: requestUrl });

    try {
      const payload = await apiGet<{ ok: boolean }>("/health");
      setHealthState({
        status: "success",
        message: JSON.stringify(payload, null, 2),
        lastUrl: requestUrl
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Health check failed.";
      setHealthState({ status: "error", message, lastUrl: requestUrl });
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top, #0f172a, #020617)",
        color: "#f8fafc",
        fontFamily: "'Space Grotesk', 'Helvetica Neue', sans-serif"
      }}
    >
      <section
        style={{
          width: "min(420px, 90vw)",
          padding: "3rem",
          borderRadius: "32px",
          background: "rgba(15, 23, 42, 0.85)",
          boxShadow: "0 20px 60px rgba(2, 6, 23, 0.7)",
          backdropFilter: "blur(12px)",
          textAlign: "center"
        }}
      >
        <p style={{ letterSpacing: "0.3em", fontSize: "0.8rem", opacity: 0.6 }}>IOT PORTAL</p>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>Access R&D Console</h1>
        <p style={{ marginBottom: "2rem", opacity: 0.7 }}>
          Continue with your trusted identity provider. No passwords, no friction.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button
            style={{ ...buttonStyle, background: "#f8fafc", color: "#0f172a" }}
            onClick={() => startOAuth("google")}
          >
            Continue with Google
          </button>
          <button
            style={{ ...buttonStyle, background: "#0b63f3", color: "#f8fafc" }}
            onClick={() => startOAuth("facebook")}
          >
            Continue with Facebook
          </button>
        </div>
        <div
          style={{
            marginTop: "2.5rem",
            textAlign: "left",
            padding: "1.5rem",
            borderRadius: "24px",
            background: "rgba(15, 23, 42, 0.65)",
            border: "1px solid rgba(248, 250, 252, 0.08)",
            fontSize: "0.95rem"
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "1.1rem", letterSpacing: "0.1em" }}>
            Debug Info
          </h2>
          <p style={{ margin: "0 0 0.5rem 0", opacity: 0.85 }}>
            Current API base URL: <strong>{resolvedBaseUrl || "Not resolved"}</strong>
          </p>
          {configError && <p style={{ margin: "0 0 0.75rem 0", color: "#f87171" }}>{configError}</p>}
          <button
            style={{ ...buttonStyle, background: "#22d3ee", color: "#0f172a", width: "100%" }}
            onClick={checkHealth}
          >
            Check API Health
          </button>
          {healthState.status !== "idle" && (
            <div style={{ marginTop: "1rem", fontFamily: "'JetBrains Mono', monospace" }}>
              <p style={{ margin: "0 0 0.25rem 0" }}>
                Status: <strong>{healthState.status}</strong>
              </p>
              {healthState.lastUrl && (
                <p style={{ margin: "0 0 0.25rem 0", wordBreak: "break-all" }}>
                  Requested URL: {healthState.lastUrl}
                </p>
              )}
              {healthState.status === "success" ? (
                <pre
                  style={{
                    margin: 0,
                    padding: "0.75rem",
                    background: "#020617",
                    borderRadius: "12px",
                    color: "#22d3ee",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {healthState.message}
                </pre>
              ) : (
                <p style={{ margin: 0, color: healthState.status === "error" ? "#f87171" : "#e2e8f0" }}>
                  {healthState.message}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Login;import type { CSSProperties } from "react";

import { providerUrl } from "../api/client";

const buttonStyle: CSSProperties = {
	padding: "0.85rem 1.25rem",
	borderRadius: "999px",
	border: "none",
	fontSize: "1rem",
	fontWeight: 600,
	cursor: "pointer",
	minWidth: "220px"
};

const Login = () => {
	const startOAuth = (provider: "google" | "facebook") => {
		window.location.href = providerUrl(provider);
	};

	return (
		<main
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "radial-gradient(circle at top, #0f172a, #020617)",
				color: "#f8fafc",
				fontFamily: "'Space Grotesk', 'Helvetica Neue', sans-serif"
			}}
		>
			<section
				style={{
					width: "min(420px, 90vw)",
					padding: "3rem",
					borderRadius: "32px",
					background: "rgba(15, 23, 42, 0.85)",
					boxShadow: "0 20px 60px rgba(2, 6, 23, 0.7)",
					backdropFilter: "blur(12px)",
					textAlign: "center"
				}}
			>
				<p style={{ letterSpacing: "0.3em", fontSize: "0.8rem", opacity: 0.6 }}>IOT PORTAL</p>
				<h1 style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>Access R&D Console</h1>
				<p style={{ marginBottom: "2rem", opacity: 0.7 }}>
					Continue with your trusted identity provider. No passwords, no friction.
				</p>
				<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
					<button
						style={{ ...buttonStyle, background: "#f8fafc", color: "#0f172a" }}
						onClick={() => startOAuth("google")}
					>
						Continue with Google
					</button>
					<button
						style={{ ...buttonStyle, background: "#0b63f3", color: "#f8fafc" }}
						onClick={() => startOAuth("facebook")}
					>
						Continue with Facebook
					</button>
				</div>
			</section>
		</main>
	);
};

export default Login;
