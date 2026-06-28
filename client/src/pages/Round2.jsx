import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import TopBar from "../components/TopBar";
import { useAuth } from "../context/AuthContext";

const QUESTION_SECONDS = 60;

export default function Round2() {
  const navigate = useNavigate();
  const { participant, updateParticipant } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [prices, setPrices] = useState({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eliminated, setEliminated] = useState(false);

  const [selected, setSelected] = useState(null);
  const [removedIndex, setRemovedIndex] = useState(null);
  const [purchaseUsed, setPurchaseUsed] = useState(null);
  const [hintText, setHintText] = useState(null);
  const [imageText, setImageText] = useState(null);
  const [doubledDown, setDoubledDown] = useState(false);
  const [feedback, setFeedback] = useState(null); // {correct, pointsEarned, correctIndex}
  const [purchasing, setPurchasing] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);

  const submittingRef = useRef(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/round2/questions");
        setQuestions(res.data.questions);
        setPrices(res.data.prices);
      } catch (err) {
        setError("Could not load the market. Refresh to try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function resetQuestionState() {
    setSelected(null);
    setRemovedIndex(null);
    setPurchaseUsed(null);
    setHintText(null);
    setImageText(null);
    setDoubledDown(false);
    setFeedback(null);
    setSecondsLeft(QUESTION_SECONDS);
    submittingRef.current = false;
  }

  const current = questions[index];

  useEffect(() => {
    if (!current || feedback) return; // stop counting once answered/shown
    if (secondsLeft <= 0) {
      handleSubmitAnswer(null); // null = timed out, no selection made
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, current, feedback]);

  async function handlePurchase(type) {
    if (!current || feedback) return;
    if (purchaseUsed && purchaseUsed !== type) {
      setError(`You already bought "${purchaseUsed}" for this question.`);
      return;
    }
    const price = prices[type];
    if ((participant.techCoins ?? 0) < price) {
      setError("Not enough TechCoins for that.");
      return;
    }
    setPurchasing(type);
    setError("");
    try {
      const res = await api.post("/round2/purchase", {
        questionId: current.id,
        purchaseType: type
      });
      updateParticipant({ techCoins: res.data.techCoins });
      setPurchaseUsed(type);
      if (type === "hint1" || type === "hint2") {
        setHintText(res.data.payload.hint);
      } else if (type === "imageReveal") {
        setImageText(res.data.payload.imageDescription);
      } else if (type === "removeOption") {
        setRemovedIndex(res.data.payload.removedIndex);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Purchase failed.");
    } finally {
      setPurchasing(null);
    }
  }

  async function handleSubmitAnswer(overrideIndex) {
    const indexToSubmit = overrideIndex !== undefined ? overrideIndex : selected;
    if (indexToSubmit === null && overrideIndex === undefined) return;
    if (!current || submittingRef.current) return;
    submittingRef.current = true;
    setError("");
    try {
      const res = await api.post("/round2/answer", {
        questionId: current.id,
        selectedIndex: indexToSubmit,
        doubledDown
      });
      setFeedback({
        correct: res.data.correct,
        pointsEarned: res.data.pointsEarned,
        correctIndex: res.data.correctIndex,
        timedOut: indexToSubmit === null
      });
      updateParticipant({ totalScore: res.data.totalScore, techCoins: res.data.techCoins });
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit answer.");
      submittingRef.current = false;
    }
  }

  async function handleNext() {
    if (index + 1 >= questions.length) {
      try {
        const res = await api.post("/round2/complete");
        if (res.data.isEliminated) {
          setEliminated(true);
          return;
        }
      } catch (err) {
        // proceed anyway
      }
      navigate("/round3");
      return;
    }
    setIndex((i) => i + 1);
    resetQuestionState();
  }

  if (loading) {
    return (
      <div className="page">
        <div className="loading-text">Opening the mystery market...</div>
      </div>
    );
  }

  if (eliminated) {
    return (
      <div className="page">
        <TopBar roundLabel="Round 2 — Mystery market" />
        <div className="main" style={{ maxWidth: 600, textAlign: "center", paddingTop: 60 }}>
          <p className="section-label">Case closed for you</p>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>You've been eliminated</h2>
          <p style={{ color: "var(--paper-dim)", fontSize: 13 }}>
            Your score in the Mystery Market placed you in the bottom quarter of detectives this
            round. Thanks for investigating — check the leaderboard to see how everyone finished.
          </p>
          <button className="btn" style={{ marginTop: 24 }} onClick={() => navigate("/leaderboard")}>
            View leaderboard
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const canDoubleDown = !purchaseUsed && !feedback;
  const urgent = secondsLeft <= 10 && !feedback;

  return (
    <div className="page">
      <TopBar roundLabel="Round 2 — Mystery market" />
      <div className="main" style={{ maxWidth: 720 }}>
        {error && <div className="error-banner">{error}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <p className="section-label" style={{ marginBottom: 0 }}>
            Question {index + 1} of {questions.length}
          </p>
          {!feedback && (
            <span
              style={{
                fontFamily: "Oswald, sans-serif",
                fontWeight: 600,
                fontSize: 18,
                color: urgent ? "var(--redact-red-bright)" : "var(--brass-bright)"
              }}
            >
              0:{String(secondsLeft).padStart(2, "0")}
            </span>
          )}
        </div>
        <div className="timer-bar-track" style={{ marginBottom: 18 }}>
          <div
            className={`timer-bar-fill ${urgent ? "urgent" : ""}`}
            style={{ width: feedback ? "100%" : `${(secondsLeft / QUESTION_SECONDS) * 100}%` }}
          />
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 18 }}>{current.prompt}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {current.options.map((opt, i) => {
              const isRemoved = i === removedIndex;
              const isSelected = selected === i;
              const isCorrectAnswer = feedback && i === feedback.correctIndex;
              const isWrongSelected = feedback && isSelected && !feedback.correct;

              let borderColor = "var(--hairline)";
              if (isSelected && !feedback) borderColor = "var(--brass)";
              if (isCorrectAnswer) borderColor = "var(--vault-green-bright)";
              if (isWrongSelected) borderColor = "var(--redact-red-bright)";

              return (
                <button
                  key={i}
                  disabled={isRemoved || !!feedback}
                  onClick={() => setSelected(i)}
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    background: isRemoved ? "var(--panel-2)" : "var(--panel)",
                    border: `1px solid ${borderColor}`,
                    color: isRemoved ? "var(--paper-dim)" : "var(--paper)",
                    cursor: isRemoved || feedback ? "default" : "pointer",
                    fontFamily: "Space Mono, monospace",
                    fontSize: 13,
                    textDecoration: isRemoved ? "line-through" : "none",
                    opacity: isRemoved ? 0.5 : 1
                  }}
                >
                  {opt}
                  {isCorrectAnswer && " \u2713"}
                </button>
              );
            })}
          </div>

          {hintText && (
            <p style={{ marginTop: 14, fontSize: 12, color: "var(--brass-bright)", fontStyle: "italic" }}>
              Hint: {hintText}
            </p>
          )}
          {imageText && (
            <p style={{ marginTop: 14, fontSize: 12, color: "var(--brass-bright)", fontStyle: "italic" }}>
              {imageText}
            </p>
          )}

          {feedback && (
            <div
              className={feedback.correct ? "success-banner" : "error-banner"}
              style={{ marginTop: 16, marginBottom: 0 }}
            >
              {feedback.timedOut
                ? "Time's up. No answer was submitted — no points awarded."
                : feedback.correct
                ? `Correct. +${feedback.pointsEarned} points${doubledDown ? " (doubled down)" : ""}.`
                : "Incorrect. No points awarded."}
            </div>
          )}
        </div>

        {!feedback && (
          <>
            <p className="section-label">TechCoin shop</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 10,
                marginBottom: 20
              }}
            >
              <ShopButton
                label="Hint 1"
                price={prices.hint1}
                onClick={() => handlePurchase("hint1")}
                disabled={purchasing || (purchaseUsed && purchaseUsed !== "hint1")}
                owned={purchaseUsed === "hint1"}
                loading={purchasing === "hint1"}
              />
              <ShopButton
                label="Hint 2"
                price={prices.hint2}
                onClick={() => handlePurchase("hint2")}
                disabled={purchasing || (purchaseUsed && purchaseUsed !== "hint2")}
                owned={purchaseUsed === "hint2"}
                loading={purchasing === "hint2"}
              />
              <ShopButton
                label="Image reveal"
                price={prices.imageReveal}
                onClick={() => handlePurchase("imageReveal")}
                disabled={purchasing || (purchaseUsed && purchaseUsed !== "imageReveal")}
                owned={purchaseUsed === "imageReveal"}
                loading={purchasing === "imageReveal"}
              />
              <ShopButton
                label="Remove option"
                price={prices.removeOption}
                onClick={() => handlePurchase("removeOption")}
                disabled={purchasing || (purchaseUsed && purchaseUsed !== "removeOption")}
                owned={purchaseUsed === "removeOption"}
                loading={purchasing === "removeOption"}
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
                fontSize: 12,
                color: canDoubleDown ? "var(--paper)" : "var(--paper-dim)",
                cursor: canDoubleDown ? "pointer" : "not-allowed"
              }}
            >
              <input
                type="checkbox"
                style={{ width: "auto" }}
                checked={doubledDown}
                disabled={!canDoubleDown}
                onChange={(e) => setDoubledDown(e.target.checked)}
              />
              Double down — skip all hints, answer for 1.5x points
            </label>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          {!feedback ? (
            <button className="btn" disabled={selected === null} onClick={() => handleSubmitAnswer()}>
              Lock in answer
            </button>
          ) : (
            <button className="btn" onClick={handleNext}>
              {index + 1 >= questions.length ? "Proceed to round 3" : "Next question"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ShopButton({ label, price, onClick, disabled, owned, loading }) {
  return (
    <button
      className="btn ghost small"
      onClick={onClick}
      disabled={disabled}
      style={{
        borderColor: owned ? "var(--vault-green-bright)" : undefined,
        color: owned ? "var(--vault-green-bright)" : undefined
      }}
    >
      {owned ? `${label} ✓` : loading ? "Buying..." : `${label} — ${price}`}
    </button>
  );
}