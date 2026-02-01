import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { apiPost, saveAuthToken } from "../api/client";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      window.location.href = "/dashboard";
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Provision a workspace for your IoT operations" footer={<a href="/login" style={{ color: "#7dd3fc" }}>Sign in instead</a>}>
      <form onSubmit={submit}>
        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem" }}>Full name</span>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" style={{ width: "100%", padding: "0.65rem", borderRadius: "0.75rem", border: "1px solid rgba(148, 163, 184, 0.4)", background: "rgba(15, 23, 42, 0.6)", color: "#f8fafc" }} />
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem" }}>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: "100%", padding: "0.65rem", borderRadius: "0.75rem", border: "1px solid rgba(148, 163, 184, 0.4)", background: "rgba(15, 23, 42, 0.6)", color: "#f8fafc" }} />
        </label>

        <label style={{ display: "block", marginBottom: "1rem" }}>
          <span style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem" }}>Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required style={{ width: "100%", padding: "0.65rem", borderRadius: "0.75rem", border: "1px solid rgba(148, 163, 184, 0.4)", background: "rgba(15, 23, 42, 0.6)", color: "#f8fafc" }} />
        </label>

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.95rem", borderRadius: "999px", background: "linear-gradient(135deg, #c084fc, #7dd3fc)", border: "none", color: "#021225", fontWeight: 700 }}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: "1.25rem", padding: "0.85rem", borderRadius: "0.75rem", background: "rgba(248, 113, 113, 0.15)", border: "1px solid rgba(248, 113, 113, 0.3)", color: "#fecaca" }}>
          {message}
        </div>
      )}
    </AuthLayout>
  );
};

export default Register;
