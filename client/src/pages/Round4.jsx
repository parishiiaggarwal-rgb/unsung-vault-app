import { useEffect, useState } from "react";
import api from "../api";
import TopBar from "../components/TopBar";
import { useAuth } from "../context/AuthContext";

export default function Round4() {
  const { participant, updateParticipant } = useAuth();

  const [question, setQuestion] = useState(null);
  const [biddingOpen, setBiddingOpen] = useState(false);
  const [bidsRevealed, setBidsRevealed] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [bidPlaced, setBidPlaced] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [lastQuestionId, setLastQuestionId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await api.get("/round4/current");
        if (cancelled) return;

        if (res.data.question?.id !== lastQuestionId) {
          // A new question came up — reset local bid state.
          setLastQuestionId(res.data.question?.id || null);
          setBidPlaced(false);
          setResult(null);
          setBidAmount(0);
        }

        setQuestion(res.data.question);
        setBiddingOpen(res.data.biddingOpen);
        setBidsRevealed(res.data.bidsRevealed);

        if (res.data.bidsRevealed && res.data.question) {
          try {
            const myRes = await api.get(`/round4/my-result/${res.data.question.id}`);
            setResult(myRes.data);
            updateParticipant({
              techCoins: myRes.data.techCoins,
              totalScore: myRes.data.totalScore
            });
          } catch (err) {
            // participant may not have bid on this one — that's fine
          }
        }
      } catch (err) {
        // keep polling silently
      }
    }

    poll();
    const interval = setInterval(poll, 2500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [lastQuestionId, updateParticipant]);

  async function handlePlaceBid() {
    if (!question) return;
    setError("");
    try {
      await api.post("/round4/bid", { questionId: question.id, bidAmount });
      setBidPlaced(true);
    } catch (err) {
      setError(err.response?.data?.error || "Could not place bid.");
    }
  }

  const maxCoins = participant?.techCoins ?? 0;

  return (
    <div className="page">
      <TopBar roundLabel="Final round — Master detective auction" />
      <div className="main" style={{ maxWidth: 600, textAlign: "center" }}>
        <p className="section-label">Secret bidding</p>
        <p style={{ color: "var(--paper-dim)", fontSize: 13, marginBottom: 30 }}>
          Bid a portion of your TechCoins for the right to answer first. Win the bid and answer
          correctly to gain your bid back as points. Win and answer wrong, and you lose it.
        </p>

        {error && <div className="error-banner">{error}</div>}

        {!question && (
          <div className="card">
            <p style={{ color: "var(--paper-dim)" }}>Waiting for the host to open the next case...</p>
          </div>
        )}

        {question && (
          <div className="card" style={{ textAlign: "left" }}>
            <p style={{ fontSize: 16, marginBottom: 16 }}>{question.prompt}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {question.options.map((opt, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 14px",
                    border: "1px solid var(--hairline)",
                    fontSize: 13,
                    color: "var(--paper-dim)"
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>

            {!biddingOpen && !bidsRevealed && (
              <p style={{ color: "var(--paper-dim)", fontSize: 12 }}>
                Bidding hasn't opened for this question yet.
              </p>
            )}

            {biddingOpen && !bidPlaced && (
              <div>
                <label style={{ fontSize: 12, color: "var(--paper-dim)", display: "block", marginBottom: 8 }}>
                  Your bid (0 – {maxCoins} TechCoins)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <input
                    type="range"
                    min={0}
                    max={maxCoins}
                    step={5}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                  />
                  <span style={{ minWidth: 50, fontFamily: "Oswald, sans-serif", fontWeight: 600, color: "var(--brass-bright)" }}>
                    {bidAmount}
                  </span>
                </div>
                <button className="btn" onClick={handlePlaceBid}>
                  Lock in bid
                </button>
              </div>
            )}

            {biddingOpen && bidPlaced && (
              <p style={{ color: "var(--brass-bright)", fontSize: 13 }}>
                Bid of {bidAmount} TechCoins locked in. Waiting for everyone else...
              </p>
            )}

            {bidsRevealed && result && (
              <div
                className={result.bid.won ? (result.bid.correct ? "success-banner" : "error-banner") : "card"}
                style={{ marginTop: 4 }}
              >
                {result.bid.won
                  ? result.bid.correct
                    ? `You won the bid and answered correctly. +${result.bid.bidAmount} points.`
                    : `You won the bid but answered incorrectly. -${result.bid.bidAmount} TechCoins.`
                  : "You didn't win this bid. Your TechCoins are safe."}
              </div>
            )}

            {bidsRevealed && !result && (
              <p style={{ color: "var(--paper-dim)", fontSize: 12 }}>
                You didn't place a bid on this question.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
