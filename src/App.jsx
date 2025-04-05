import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSelector } from "react-redux";
import NotFound from "./pages/404";

function App() {

  const isAuthenticated = useSelector((state) => state.auth.user);
  console.log(isAuthenticated)
  return (
    <Routes>
      {/* Root route: Redirect based on authentication */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Navigate to="/auth/sign-in" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
      {/* Protected dashboard route */}
      <Route path="/dashboard/*" element={<ProtectedRoute />}>
        <Route path="*" element={<Dashboard />} />
      </Route>
      {/* Authentication route */}
      <Route path="/auth/*" element={<Auth />} />
      {/* Catch-all route: Show 404 for any undefined URL */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
