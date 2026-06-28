import { useEffect, useState } from "react";
import api from "../api";
import TopBar from "../components/TopBar";

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get("/leaderboard");
        if (!cancelled) setEntries(res.data.leaderboard);
      } catch (err) {
        if (!cancelled) setError("Could not load the leaderboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="page">
      <TopBar roundLabel="Final standings" />
      <div className="main" style={{ maxWidth: 700 }}>
        <p className="section-label">Case closed</p>
        <h2 style={{ fontSize: 26, marginBottom: 24 }}>Vault leaderboard</h2>

        {error && <div className="error-banner">{error}</div>}
        {loading && <div className="loading-text">Tallying the evidence...</div>}

        {!loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map((e) => (
              <div
                key={e.rank}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderColor: e.rank <= 3 && !e.isEliminated ? "var(--brass)" : "var(--hairline)",
                  opacity: e.isEliminated ? 0.55 : 1
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      fontWeight: 700,
                      fontSize: 22,
                      color: "var(--brass)",
                      minWidth: 32
                    }}
                  >
                    {e.rank}
                  </span>
                  <div>
                    <p style={{ margin: 0, fontFamily: "Oswald, sans-serif", fontWeight: 600 }}>
                      {e.name}
                      {e.isEliminated && (
                        <span
                          className="stamp-tag"
                          style={{ marginLeft: 10, color: "var(--redact-red-bright)", fontSize: 9 }}
                        >
                          Eliminated &middot; round {e.eliminatedAfterRound}
                        </span>
                      )}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--brass-bright)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {e.title}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontFamily: "Oswald, sans-serif", fontWeight: 600 }}>{e.totalScore} pts</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--paper-dim)" }}>{e.techCoins} coins left</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}