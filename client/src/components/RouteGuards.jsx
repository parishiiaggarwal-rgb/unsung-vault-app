import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireParticipant({ children }) {
  const { participant } = useAuth();
  if (!participant) return <Navigate to="/" replace />;
  if (participant.isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { participant } = useAuth();
  if (!participant) return <Navigate to="/admin-login" replace />;
  if (!participant.isAdmin) return <Navigate to="/" replace />;
  return children;
}
