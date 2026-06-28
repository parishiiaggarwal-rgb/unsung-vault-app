import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import TopBar from "../components/TopBar";

export default function Lobby() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Waiting for the host to unlock the vault...");

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await api.get("/round1/status");
        if (cancelled) return;
        if (res.data.activeRound >= 1) {
          navigate("/round1");
        }
      } catch (err) {
        // Stay quiet on transient poll errors — just keep trying.
      }
    }

    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className="page">
      <TopBar roundLabel="Lobby" />
      <div className="main" style={{ textAlign: "center", paddingTop: 100 }}>
        <p className="section-label">Case file no. UN-1986</p>
        <h2 style={{ fontSize: 28, marginBottom: 20 }}>Vault sealed</h2>
        <p style={{ color: "var(--paper-dim)", maxWidth: 480, margin: "0 auto" }}>{status}</p>
        <div style={{ marginTop: 40 }}>
          <span className="stamp-tag" style={{ color: "var(--brass)" }}>
            Standing by
          </span>
        </div>
      </div>
    </div>
  );
}
