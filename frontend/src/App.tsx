import Login from "./pages/Login";
import Register from "./pages/Register";

const App = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is required for the frontend to contact the API");
  }

  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  if (path.startsWith("/register")) return <Register />;
  return <Login />;
};

export default App;
