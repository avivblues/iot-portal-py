import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiPost } from "../api/client";
import AuthLayout from "../components/AuthLayout";
import ErrorState from "../components/ErrorState";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiPost<{ access_token: string; token_type: string }>("/auth/register", {
        email,
        password,
        full_name: fullName,
      });
      await loginWithToken(data.access_token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Provision a tenant to orchestrate assets, alerts, and automations"
      footer={
        <p>
          Already onboarded? <Link className="text-primary" to="/login">Sign in</Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button className="w-full" disabled={loading} type="submit">
          {loading ? "Creating…" : "Create workspace"}
        </Button>
      </form>
      {error && (
        <div className="mt-6">
          <ErrorState description={error} actionLabel="Try again" onAction={() => setError(null)} />
        </div>
      )}
    </AuthLayout>
  );
};

export default Register;
