import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user } = useContext(AuthContext);

  // Prevent logged-in users from opening login/register
  if (user) {
    if (user.role === "seller") return <Navigate to="/seller" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />; // buyer default
  }

  return children;
}
