import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TopBar({ roundLabel }) {
  const { participant, logout } = useAuth();
  const navigate = useNavigate();

  if (!participant) return null;

  return (
    <div className="topbar">
      <span className="brand">Unsung &middot; Tech Mystery Vault</span>
      <span className="stat">
        <span className="label">Detective</span>
        {participant.name}
      </span>
      {roundLabel && <span className="stat">{roundLabel}</span>}
      <span className="stat">
        <span className="label">TechCoins</span>
        <span className="coin-value">{participant.techCoins ?? 0}</span>
      </span>
      <span className="stat">
        <span className="label">Score</span>
        {participant.totalScore ?? 0}
      </span>
      <button
        className="btn ghost small"
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        Exit
      </button>
    </div>
  );
}
