import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { clearToken, saveToken } from "../api/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      saveToken(token);
      navigate("/dashboard", { replace: true });
    } else {
      clearToken();
      navigate("/login", { replace: true });
    }
  }, [navigate]);

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
      <p>Finishing secure sign-in…</p>
    </section>
  );
};

export default AuthCallback;
