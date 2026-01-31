import type { CSSProperties } from "react";

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
