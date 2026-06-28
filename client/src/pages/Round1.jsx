import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import TopBar from "../components/TopBar";

export default function Round1() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [opened, setOpened] = useState(new Set());
  const [flipped, setFlipped] = useState(new Set());
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const completingRef = useRef(false);

  const completeRound = useCallback(async () => {
    if (completingRef.current) return;
    completingRef.current = true;
    try {
      await api.post("/round1/complete");
    } catch (err) {
      // even if this fails, still move the user forward locally
    }
    navigate("/round2");
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [filesRes, statusRes] = await Promise.all([
          api.get("/round1/files"),
          api.get("/round1/status")
        ]);
        if (cancelled) return;
        setFiles(filesRes.data.files);

        const { round1 } = statusRes.data;
        if (round1.isRunning && round1.startedAt) {
          const elapsed = (Date.now() - new Date(round1.startedAt).getTime()) / 1000;
          const remaining = Math.max(0, Math.round(round1.durationSeconds - elapsed));
          setSecondsLeft(remaining);
        } else {
          // Round not started server-side yet but participant landed here —
          // give a default 20 min so the page is still usable standalone.
          setSecondsLeft(round1.durationSeconds || 1200);
        }
      } catch (err) {
        if (!cancelled) setError("Could not load the case files. Refresh to try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      completeRound();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, completeRound]);

  async function handleOpen(code) {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
    if (!opened.has(code)) {
      setOpened((prev) => new Set(prev).add(code));
      try {
        await api.post("/round1/open", { code });
      } catch (err) {
        // non-critical — progress tracking only
      }
    }
  }

  if (loading) return <LoadingShell />;

  const minutes = Math.floor((secondsLeft || 0) / 60);
  const seconds = (secondsLeft || 0) % 60;
  const totalDuration = 1200;
  const pctRemaining = secondsLeft !== null ? Math.max(0, (secondsLeft / totalDuration) * 100) : 100;
  const urgent = secondsLeft !== null && secondsLeft < 60;

  return (
    <div className="page">
      <TopBar roundLabel="Round 1 — Memory vault" />
      <div className="main">
        {error && <div className="error-banner">{error}</div>}

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span className="section-label" style={{ marginBottom: 0 }}>
              {opened.size} / {files.length} files opened
            </span>
            <span style={{ color: urgent ? "var(--redact-red-bright)" : "var(--brass-bright)", fontFamily: "Oswald, sans-serif", fontSize: 18, fontWeight: 600 }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
          <div className="timer-bar-track">
            <div
              className={`timer-bar-fill ${urgent ? "urgent" : ""}`}
              style={{ width: `${pctRemaining}%` }}
            />
          </div>
        </div>

        <p style={{ color: "var(--paper-dim)", fontSize: 13, marginBottom: 28 }}>
          Click a folder to open the dossier inside. Some names are redacted — you'll need the
          artifact and field of work to place them later. Files lock automatically when the timer
          ends.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 18
          }}
        >
          {files.map((file) => (
            <DossierCard
              key={file.code}
              file={file}
              isFlipped={flipped.has(file.code)}
              onToggle={() => handleOpen(file.code)}
            />
          ))}
        </div>

        <div style={{ marginTop: 40, textAlign: "center" }}>
          <button className="btn" onClick={completeRound}>
            Submit and proceed to round 2
          </button>
        </div>
      </div>
    </div>
  );
}

function DossierCard({ file, isFlipped, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        background: "var(--panel)",
        border: `1px solid ${isFlipped ? "var(--brass)" : "var(--hairline)"}`,
        cursor: "pointer",
        minHeight: 200,
        padding: 16,
        transition: "border-color 0.2s ease"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--paper-dim)",
          marginBottom: 12
        }}
      >
        <span>
          Dossier <span style={{ color: "var(--brass)" }}>{file.code}</span>
        </span>
        <span>{isFlipped ? "Open" : "Sealed"}</span>
      </div>

      {!isFlipped ? (
        <div style={{ textAlign: "center", paddingTop: 30 }}>
          <p style={{ color: "var(--paper-dim)", fontSize: 12, letterSpacing: "0.08em" }}>
            Click to open file
          </p>
        </div>
      ) : (
        <div>
          <p
            style={{
              fontFamily: file.isRedacted ? "Space Mono, monospace" : "Oswald, sans-serif",
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: file.isRedacted ? "0.05em" : "normal",
              textTransform: "uppercase",
              margin: "0 0 4px",
              color: file.isRedacted ? "var(--redact-red-bright)" : "var(--paper)"
            }}
          >
            {file.name}
          </p>
        </div>
      )}
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="page">
      <div className="loading-text">Opening the vault...</div>
    </div>
  );
}
