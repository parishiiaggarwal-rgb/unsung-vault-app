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

  async function call(path, body) {
    setError("");
    setInfo("");
    try {
      await api.post(path, body || {});
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
    </ControlBlock>
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
