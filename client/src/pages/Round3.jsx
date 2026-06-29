import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import TopBar from "../components/TopBar";
import { useAuth } from "../context/AuthContext";

const CASE_SECONDS = 120;

export default function Round3() {
  const navigate = useNavigate();
  const { updateParticipant } = useAuth();

  const [cases, setCases] = useState([]);
  const [caseIndex, setCaseIndex] = useState(0);
  const [assignments, setAssignments] = useState({}); // clueId -> code | null
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draggingClueId, setDraggingClueId] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(CASE_SECONDS);
  const [eliminated, setEliminated] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const submittingRef = useRef(false);
  const assignmentsRef = useRef(assignments);
  assignmentsRef.current = assignments;

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/round3/cases");
        setCases(res.data.cases);
      } catch (err) {
        setError("Could not load the evidence board. Refresh to try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const current = cases[caseIndex];

  useEffect(() => {
    if (!current || result) return; // stop counting once submitted/graded
    if (secondsLeft <= 0) {
      handleSubmitCase(true);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, current, result]);

  function handleDrop(code) {
    if (!draggingClueId || result || submittingRef.current) return;
    setAssignments((prev) => ({ ...prev, [draggingClueId]: code }));
    setDraggingClueId(null);
  }

  function handleUnassign(clueId) {
    if (result || submittingRef.current) return;
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[clueId];
      return next;
    });
  }

  async function handleSubmitCase(isTimeout = false) {
    if (!current || submittingRef.current) return;
    submittingRef.current = true;
    setError("");
    const liveAssignments = assignmentsRef.current;
    const matches = current.clues.map((c) => ({
      clueId: c.id,
      assignedCode: liveAssignments[c.id] || null
    }));
    try {
      const res = await api.post("/round3/submit", { caseId: current.id, matches });
      setResult(res.data);
      setTimedOut(isTimeout);
      updateParticipant({ totalScore: res.data.totalScore });
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit case.");
      submittingRef.current = false;
    }
  }

  async function handleNextCase() {
    if (caseIndex + 1 >= cases.length) {
      try {
        const res = await api.post("/round3/complete");
        if (res.data.isEliminated) {
          setEliminated(true);
          return;
        }
      } catch (err) {
        // proceed anyway
      }
      navigate("/leaderboard");
      return;
    }
    setCaseIndex((i) => i + 1);
    setAssignments({});
    setResult(null);
    setSecondsLeft(CASE_SECONDS);
    setTimedOut(false);
    submittingRef.current = false;
  }

  if (loading) {
    return (
      <div className="page">
        <div className="loading-text">Laying out the evidence board...</div>
      </div>
    );
  }

  if (eliminated) {
    return (
      <div className="page">
        <TopBar roundLabel="Round 3 — Case file challenge" />
        <div className="main" style={{ maxWidth: 600, textAlign: "center", paddingTop: 60 }}>
          <p className="section-label">Case closed for you</p>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>You've been eliminated</h2>
          <p style={{ color: "var(--paper-dim)", fontSize: 13 }}>
            Your combined score placed you in the bottom quarter of the remaining detectives.
            Thanks for investigating — check the leaderboard to see how everyone finished.
          </p>
          <button className="btn" style={{ marginTop: 24 }} onClick={() => navigate("/leaderboard")}>
            View leaderboard
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const assignedClueIds = new Set(Object.keys(assignments));
  const unassignedClues = current.clues.filter((c) => !assignedClueIds.has(c.id));
  const urgent = secondsLeft <= 20 && !result;

  return (
    <div className="page">
      <TopBar roundLabel="Round 3 — Case file challenge" />
      <div className="main">
        {error && <div className="error-banner">{error}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <p className="section-label" style={{ marginBottom: 0 }}>
            Case {caseIndex + 1} of {cases.length}
          </p>
          {!result && (
            <span
              style={{
                fontFamily: "Oswald, sans-serif",
                fontWeight: 600,
                fontSize: 18,
                color: urgent ? "var(--redact-red-bright)" : "var(--brass-bright)"
              }}
            >
              {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
            </span>
          )}
        </div>
        <div className="timer-bar-track" style={{ marginBottom: 18 }}>
          <div
            className={`timer-bar-fill ${urgent ? "urgent" : ""}`}
            style={{ width: result ? "100%" : `${(secondsLeft / CASE_SECONDS) * 100}%` }}
          />
        </div>

        <h2 style={{ fontSize: 22, marginBottom: 6 }}>{current.title}</h2>
        <p style={{ color: "var(--paper-dim)", fontSize: 13, marginBottom: 28 }}>
          Drag each clue onto the detective it belongs to. Some clues don't belong to anyone on
          this board — leave those unassigned.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 24 }}>
          <div>
            <p className="section-label">Unassigned clues</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 80 }}>
              {unassignedClues.length === 0 && (
                <p style={{ color: "var(--paper-dim)", fontSize: 12 }}>
                  All clues placed. Submit when ready.
                </p>
              )}
              {unassignedClues.map((clue) => (
                <div
                  key={clue.id}
                  draggable={!result && !submittingRef.current}
                  onDragStart={() => setDraggingClueId(clue.id)}
                  className="card"
                  style={{
                    padding: "10px 14px",
                    fontSize: 12,
                    cursor: result ? "default" : "grab",
                    borderColor: result ? gradeColor(result, clue.id) : "var(--hairline)"
                  }}
                >
                  {clue.text}
                  {result && <GradeMark result={result} clueId={clue.id} />}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="section-label">Detectives on this case</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {current.options.map((opt) => (
                <div
                  key={opt.code}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(opt.code)}
                  className="card"
                  style={{ padding: 14, minHeight: 70 }}
                >
                  <p
                    style={{
                      fontFamily: "Oswald, sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      textTransform: "uppercase",
                      margin: "0 0 2px"
                    }}
                  >
                    {opt.name}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--brass)", margin: "0 0 10px" }}>{opt.field}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {current.clues
                      .filter((c) => assignments[c.id] === opt.code)
                      .map((c) => (
                        <div
                          key={c.id}
                          onClick={() => handleUnassign(c.id)}
                          style={{
                            fontSize: 11,
                            padding: "8px 10px",
                            background: "var(--panel-2)",
                            border: `1px solid ${result ? gradeColor(result, c.id) : "var(--hairline)"}`,
                            cursor: result ? "default" : "pointer"
                          }}
                          title={result ? "" : "Click to unassign"}
                        >
                          {c.text}
                          {result && <GradeMark result={result} clueId={c.id} />}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {result && (
          <div className="success-banner" style={{ marginTop: 24 }}>
            {timedOut && "Time ran out — submitted as-is. "}
            {result.correctMatches} / {result.totalClues} clues correctly placed. +
            {result.pointsEarned} points.
          </div>
        )}

        <div style={{ marginTop: 28, textAlign: "right" }}>
          {!result ? (
            <button className="btn" onClick={() => handleSubmitCase(false)}>
              Submit case
            </button>
          ) : (
            <button className="btn" onClick={handleNextCase}>
              {caseIndex + 1 >= cases.length ? "View final leaderboard" : "Next case"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function gradeColor(result, clueId) {
  const r = result.results.find((x) => x.clueId === clueId);
  if (!r) return "var(--hairline)";
  return r.isCorrect ? "var(--vault-green-bright)" : "var(--redact-red-bright)";
}

function GradeMark({ result, clueId }) {
  const r = result.results.find((x) => x.clueId === clueId);
  if (!r) return null;
  return (
    <span style={{ marginLeft: 6, color: r.isCorrect ? "var(--vault-green-bright)" : "var(--redact-red-bright)" }}>
      {r.isCorrect ? "✓" : "✗"}
    </span>
  );
}