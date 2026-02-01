import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { apiPost } from "../api/client";
import AuthLayout from "../components/AuthLayout";
import ErrorState from "../components/ErrorState";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";

type LocationState = { from?: { pathname: string } };

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiPost<{ access_token: string; token_type: string }>("/auth/login", { email, password });
      await loginWithToken(data.access_token);
      const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Authenticate to orchestrate devices, energy, and automation policies"
      footer={
        <p>
          Need an account? <Link className="text-primary" to="/register">Create one</Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button className="w-full" disabled={loading} type="submit">
          {loading ? "Signing in…" : "Sign in"}
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

export default Login;
