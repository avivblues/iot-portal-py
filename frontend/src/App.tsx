import Login from "./pages/Login";

const App = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is required for the frontend to contact the API");
  }

  return <Login />;
};

export default App;
