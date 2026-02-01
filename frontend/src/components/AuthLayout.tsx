import { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => (
  <main
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at top, #1e1b4b, #020617)",
      color: "#e2e8f0",
      padding: "2rem",
      fontFamily: '"Space Grotesk", system-ui, sans-serif'
    }}
  >
    <section
      style={{
        width: "min(440px, 100%)",
        padding: "2.75rem",
        borderRadius: "1.5rem",
        background: "rgba(15, 23, 42, 0.85)",
        boxShadow: "0 25px 80px rgba(2, 6, 23, 0.75)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(148, 163, 184, 0.15)"
      }}
    >
      <p style={{ letterSpacing: "0.3em", fontSize: "0.75rem", opacity: 0.7, textTransform: "uppercase" }}>IoT Portal</p>
      <h1 style={{ marginTop: "0.35rem", marginBottom: "0.35rem", fontSize: "2rem", fontWeight: 600 }}>{title}</h1>
      {subtitle && <p style={{ marginBottom: "1.5rem", opacity: 0.8 }}>{subtitle}</p>}
      {children}
      {footer && <div style={{ marginTop: "1.25rem" }}>{footer}</div>}
    </section>
  </main>
);

export default AuthLayout;
