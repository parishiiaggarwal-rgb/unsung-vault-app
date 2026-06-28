import { useEffect, useState } from "react";
import api from "../api";
import TopBar from "../components/TopBar";

export default function AdminPanel() {
  const [state, setState] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function refresh() {
    try {
      const [stateRes, lbRes] = await Promise.all([
        api.get("/admin/state"),
        api.get("/admin/leaderboard")
      ]);
      setState(stateRes.data.state);
      setLeaderboard(lbRes.data.leaderboard);
    } catch (err) {
      setError("Could not load admin state.");
    }
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
  }, []);

  async function call(path, body, method = "post") {
    setError("");
    setInfo("");
    try {
      if (method === "delete") {
        await api.delete(path);
      } else {
        await api.post(path, body || {});
      }
      setInfo("Done.");
      refresh();
    } catch (err) {
      setError(err.response?.data?.error || "Action failed.");
    }
  }

  if (!state) {
    return (
      <div className="page">
        <div className="loading-text">Loading host panel...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <TopBar roundLabel="Event host panel" />
      <div className="main">
        {error && <div className="error-banner">{error}</div>}
        {info && <div className="success-banner">{info}</div>}

        <p className="section-label">Current state</p>
        <div className="card" style={{ marginBottom: 28 }}>
          <p style={{ margin: 0, fontSize: 13 }}>
            Active round: <strong style={{ color: "var(--brass-bright)" }}>{state.activeRound}</strong>
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 13 }}>
            Round 1 timer running: {state.round1.isRunning ? "yes" : "no"}
          </p>
        </div>

        <Round1Controls call={call} state={state} />
        <Round3Controls call={call} state={state} />
        <Round4Controls call={call} state={state} />
        <GeneralControls call={call} />
        <AccessCodesPanel />

        <p className="section-label" style={{ marginTop: 36 }}>
          Live leaderboard
        </p>
        <div className="card">
          {leaderboard.length === 0 && <p style={{ color: "var(--paper-dim)", fontSize: 13 }}>No participants yet.</p>}
          {leaderboard.map((p, i) => (
            <div
              key={p._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: i === leaderboard.length - 1 ? "none" : "1px solid var(--hairline)",
                fontSize: 13
              }}
            >
              <span>
                {i + 1}. {p.name}{" "}
                <span style={{ color: "var(--paper-dim)" }}>(round {p.currentRound})</span>
              </span>
              <span>
                {p.totalScore} pts &middot; {p.techCoins} coins
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Round1Controls({ call, state }) {
  return (
    <ControlBlock title="Round 1 — Memory vault">
      <button className="btn small" onClick={() => call("/admin/round1/start")}>
        Start 20-min timer
      </button>
      <button className="btn ghost small" onClick={() => call("/admin/round1/stop")}>
        Stop timer
      </button>
      <button className="btn ghost small" onClick={() => call("/admin/advance-round", { round: 2 })}>
        Force-advance everyone to round 2
      </button>
    </ControlBlock>
  );
}

function Round3Controls({ call }) {
  const [caseIndex, setCaseIndex] = useState(0);
  return (
    <ControlBlock title="Round 3 — Case file challenge">
      <input
        type="number"
        min={0}
        max={5}
        value={caseIndex}
        onChange={(e) => setCaseIndex(Number(e.target.value))}
        style={{ width: 80 }}
      />
      <button className="btn small" onClick={() => call("/admin/round3/set-case", { caseIndex })}>
        Set visible case index
      </button>
      <button className="btn ghost small" onClick={() => call("/admin/advance-round", { round: 4 })}>
        Force-advance everyone to round 4
      </button>
    </ControlBlock>
  );
}

function Round4Controls({ call, state }) {
  const [questionId, setQuestionId] = useState("Q15");
  const [winnerId, setWinnerId] = useState("");
  const [winnerCorrect, setWinnerCorrect] = useState(true);

  return (
    <ControlBlock title="Round 4 — Master detective auction">
      <input
        placeholder="Question ID e.g. Q15"
        value={questionId}
        onChange={(e) => setQuestionId(e.target.value)}
        style={{ width: 160 }}
      />
      <button className="btn small" onClick={() => call("/admin/round4/set-question", { questionId })}>
        Set question
      </button>
      <button className="btn small" onClick={() => call("/admin/round4/open-bidding")}>
        Open bidding
      </button>
      <button
        className="btn small"
        onClick={async () => {
          await call("/admin/round4/close-bidding");
        }}
      >
        Close bidding + reveal
      </button>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, width: "100%" }}>
        <input
          placeholder="Winner participant ID"
          value={winnerId}
          onChange={(e) => setWinnerId(e.target.value)}
          style={{ width: 220 }}
        />
        <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            style={{ width: "auto" }}
            checked={winnerCorrect}
            onChange={(e) => setWinnerCorrect(e.target.checked)}
          />
          Winner answered correctly
        </label>
        <button
          className="btn small"
          onClick={() =>
            call("/admin/round4/resolve", { questionId, winnerParticipantId: winnerId, winnerCorrect })
          }
        >
          Resolve bid
        </button>
      </div>
      <p style={{ fontSize: 11, color: "var(--paper-dim)", marginTop: 8 }}>
        Use "Close bidding + reveal" to fetch ranked bids on the server side first (check server
        logs or extend this panel to display them), then enter the winner's participant ID here
        to resolve coin/score changes.
      </p>
    </ControlBlock>
  );
}

function GeneralControls({ call }) {
  return (
    <ControlBlock title="Event controls">
      <button className="btn ghost small" onClick={() => call("/admin/advance-round", { round: 5 })}>
        End event / show final leaderboard
      </button>
      <button
        className="btn danger small"
        onClick={() => {
          if (window.confirm("This resets the round/timer back to the lobby for everyone. Participant scores are kept. Continue?")) {
            call("/admin/reset-game");
          }
        }}
      >
        Reset game state (back to lobby)
      </button>
      <button
        className="btn danger small"
        onClick={() => {
          if (window.confirm("This permanently deletes ALL participants and their scores. This cannot be undone. Continue?")) {
            call("/admin/participants/reset", null, "delete");
          }
        }}
      >
        Wipe all participants
      </button>
    </ControlBlock>
  );
}

function AccessCodesPanel() {
  const [count, setCount] = useState(20);
  const [prefix, setPrefix] = useState("DET");
  const [codes, setCodes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadCodes() {
    try {
      const res = await api.get("/admin/codes");
      setCodes(res.data.codes);
    } catch (err) {
      setError("Could not load codes.");
    }
  }

  useEffect(() => {
    loadCodes();
  }, []);

  async function handleGenerate() {
    setError("");
    setLoading(true);
    try {
      await api.post("/admin/codes/generate", { count, prefix });
      await loadCodes();
    } catch (err) {
      setError(err.response?.data?.error || "Could not generate codes.");
    } finally {
      setLoading(false);
    }
  }

  async function handleClearUnclaimed() {
    setError("");
    try {
      await api.delete("/admin/codes/unclaimed");
      await loadCodes();
    } catch (err) {
      setError("Could not clear unclaimed codes.");
    }
  }

  function handlePrint() {
    window.print();
  }

  const unclaimedCount = codes.filter((c) => !c.isClaimed).length;
  const claimedCount = codes.filter((c) => c.isClaimed).length;

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <p className="section-label" style={{ marginBottom: 12 }}>
        Participant access codes
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: "var(--paper-dim)" }}>
          How many
          <input
            type="number"
            min={1}
            max={200}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ width: 80, marginLeft: 8 }}
          />
        </label>
        <label style={{ fontSize: 12, color: "var(--paper-dim)" }}>
          Prefix
          <input
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            style={{ width: 80, marginLeft: 8 }}
          />
        </label>
        <button className="btn small" onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate codes"}
        </button>
        <button className="btn ghost small" onClick={handleClearUnclaimed}>
          Clear unclaimed codes
        </button>
        <button className="btn ghost small" onClick={handlePrint}>
          Print list
        </button>
      </div>

      <p style={{ fontSize: 12, color: "var(--paper-dim)", marginBottom: 12 }}>
        {codes.length} total codes &middot; {claimedCount} claimed &middot; {unclaimedCount} waiting
        to be handed out
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 8,
          maxHeight: 320,
          overflowY: "auto"
        }}
      >
        {codes.map((c) => (
          <div
            key={c.accessCode}
            style={{
              padding: "8px 10px",
              border: `1px solid ${c.isClaimed ? "var(--vault-green-bright)" : "var(--hairline)"}`,
              fontSize: 12
            }}
          >
            <p style={{ margin: 0, fontFamily: "Oswald, sans-serif", fontWeight: 600, color: "var(--brass-bright)" }}>
              {c.accessCode}
            </p>
            <p style={{ margin: 0, color: "var(--paper-dim)" }}>
              {c.isClaimed ? c.name : "Not yet used"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ControlBlock({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <p className="section-label" style={{ marginBottom: 12 }}>
        {title}
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>{children}</div>
    </div>
  );
}