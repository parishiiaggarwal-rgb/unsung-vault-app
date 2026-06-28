import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import TopBar from "../components/TopBar";
import { useAuth } from "../context/AuthContext";

export default function Round2() {
  const navigate = useNavigate();
  const { participant, updateParticipant } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [prices, setPrices] = useState({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState(null);
  const [removedIndex, setRemovedIndex] = useState(null);
  const [purchaseUsed, setPurchaseUsed] = useState(null);
  const [hintText, setHintText] = useState(null);
  const [imageText, setImageText] = useState(null);
  const [doubledDown, setDoubledDown] = useState(false);
  const [feedback, setFeedback] = useState(null); // {correct, pointsEarned, correctIndex}
  const [purchasing, setPurchasing] = useState(null);

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
  }

  const current = questions[index];

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

  async function handleSubmitAnswer() {
    if (selected === null || !current) return;
    setError("");
    try {
      const res = await api.post("/round2/answer", {
        questionId: current.id,
        selectedIndex: selected,
        doubledDown
      });
      setFeedback({
        correct: res.data.correct,
        pointsEarned: res.data.pointsEarned,
        correctIndex: res.data.correctIndex
      });
      updateParticipant({ totalScore: res.data.totalScore, techCoins: res.data.techCoins });
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit answer.");
    }
  }

  async function handleNext() {
    if (index + 1 >= questions.length) {
      try {
        await api.post("/round2/complete");
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

  if (!current) return null;

  const canDoubleDown = !purchaseUsed && !feedback;

  return (
    <div className="page">
      <TopBar roundLabel="Round 2 — Mystery market" />
      <div className="main" style={{ maxWidth: 720 }}>
        {error && <div className="error-banner">{error}</div>}

        <p className="section-label">
          Question {index + 1} of {questions.length}
        </p>

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
              {feedback.correct
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
            <button className="btn" disabled={selected === null} onClick={handleSubmitAnswer}>
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
