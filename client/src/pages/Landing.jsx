import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const [name, setName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !accessCode.trim()) {
      setError("Enter both your name and your access code.");
      return;
    }
    setLoading(true);
    try {
      const participant = await login(name.trim(), accessCode.trim());
      routeToCurrentRound(participant, navigate);
    } catch (err) {
      setError(err.response?.data?.error || "Could not enter the vault. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "6vh 6vw"
      }}
    >
      <p className="section-label">Classified archive &middot; women in technology</p>
      <h1
        style={{
          fontSize: "clamp(40px, 8vw, 88px)",
          lineHeight: 0.95,
          marginBottom: 6,
          color: "var(--paper)"
        }}
      >
        Unsung
      </h1>
      <h2
        style={{
          fontSize: "clamp(16px, 3vw, 28px)",
          color: "var(--brass-bright)",
          fontWeight: 500,
          marginBottom: 28
        }}
      >
        The Tech Mystery Vault
      </h2>
      <p style={{ color: "var(--paper-dim)", fontSize: 13, marginBottom: 36, maxWidth: 420 }}>
        An individual detective challenge. Enter your name and the access code given to you at
        the door to begin your investigation.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ width: "min(360px, 88vw)", display: "flex", flexDirection: "column", gap: 14 }}
      >
        {error && <div className="error-banner">{error}</div>}
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <input
          placeholder="Access code"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          style={{ textTransform: "uppercase" }}
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Unlocking..." : "Enter the vault"}
        </button>
      </form>

      <button
        className="btn ghost small"
        style={{ marginTop: 40 }}
        onClick={() => navigate("/admin-login")}
      >
        Event host login
      </button>
    </div>
  );
}

export function routeToCurrentRound(participant, navigate) {
  if (participant.isAdmin) {
    navigate("/admin");
    return;
  }
  const round = participant.currentRound || 0;
  if (round <= 0) navigate("/lobby");
  else if (round === 1) navigate("/round1");
  else if (round === 2) navigate("/round2");
  else if (round === 3) navigate("/round3");
  else if (round === 4) navigate("/round4");
  else navigate("/leaderboard");
}
