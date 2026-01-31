import { useState } from "react";


import { apiPost, saveAuthToken } from "../api/client";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lastUser, setLastUser] = useState<any | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await apiPost<{ access_token: string; token_type: string; user: any }, { email: string; password: string; full_name?: string }>(
        "/auth/register",
        { email, password, full_name: fullName }
      );
      saveAuthToken(data.access_token);
      setLastUser(data.user);
      setMessage("Account created and signed in");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#f8fafc", padding: "2rem" }}>
      <section style={{ width: "min(480px, 100%)", padding: "2.5rem", borderRadius: "1rem", background: "#1e293b" }}>
        <p style={{ letterSpacing: "0.3em", fontSize: "0.75rem", opacity: 0.7 }}>IOT PORTAL</p>
        <h1 style={{ marginTop: "0.5rem", marginBottom: "1rem" }}>Create account</h1>

        <form onSubmit={submit}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            <div style={{ marginBottom: "0.25rem", fontSize: "0.9rem" }}>Full name</div>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem" }} />
          </label>

          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            <div style={{ marginBottom: "0.25rem", fontSize: "0.9rem" }}>Email</div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem" }} />
          </label>

          <label style={{ display: "block", marginBottom: "0.75rem" }}>
            <div style={{ marginBottom: "0.25rem", fontSize: "0.9rem" }}>Password</div>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem" }} />
          </label>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.9rem", borderRadius: "999px", background: "#22d3ee", color: "#0f172a", fontWeight: 700 }}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <div style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          <a href="/login" style={{ color: "#7dd3fc" }}>Sign in instead</a>
        </div>

        {message && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "0.5rem", background: "#0b1220" }}>
            <strong>Status:</strong> {message}
            {lastUser && (
              <pre style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap" }}>{JSON.stringify(lastUser, null, 2)}</pre>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default Register;
