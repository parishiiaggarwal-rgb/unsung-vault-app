const express = require("express");
const router = express.Router();
const Participant = require("../models/Participant");
const GameState = require("../models/GameState");
const questions = require("../data/questions");
const cases = require("../data/cases");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.use(requireAuth, requireAdmin);

async function getOrCreateState() {
  let state = await GameState.findOne({ singleton: "main" });
  if (!state) state = await GameState.create({ singleton: "main" });
  return state;
}

// GET /api/admin/state
router.get("/state", async (req, res) => {
  const state = await getOrCreateState();
  res.json({ state });
});

// POST /api/admin/round1/start
// Starts the 20-minute Memory Vault timer for everyone.
router.post("/round1/start", async (req, res) => {
  const state = await getOrCreateState();
  state.activeRound = 1;
  state.round1.isRunning = true;
  state.round1.startedAt = new Date();
  await state.save();
  res.json({ ok: true, state });
});

// POST /api/admin/round1/stop
router.post("/round1/stop", async (req, res) => {
  const state = await getOrCreateState();
  state.round1.isRunning = false;
  await state.save();
  res.json({ ok: true, state });
});

// POST /api/admin/advance-round
// Body: { round } — moves the global activeRound marker forward (2, 3, 4, 5).
router.post("/advance-round", async (req, res) => {
  const { round } = req.body;
  const state = await getOrCreateState();
  state.activeRound = round;
  await state.save();
  res.json({ ok: true, state });
});

// --- Round 3 admin: reveal cases one at a time ---
// POST /api/admin/round3/set-case
// Body: { caseIndex }
router.post("/round3/set-case", async (req, res) => {
  const { caseIndex } = req.body;
  const state = await getOrCreateState();
  state.round3CaseIndex = caseIndex;
  await state.save();
  res.json({ ok: true, state, totalCases: cases.length });
});

// --- Round 4 admin: control the auction ---

// POST /api/admin/round4/set-question
// Body: { questionId }
router.post("/round4/set-question", async (req, res) => {
  const { questionId } = req.body;
  const question = questions.find((q) => q.id === questionId);
  if (!question) return res.status(400).json({ error: "Unknown question." });

  const state = await getOrCreateState();
  state.round4.currentQuestionId = questionId;
  state.round4.biddingOpen = false;
  state.round4.bidsRevealed = false;
  await state.save();
  res.json({ ok: true, state });
});

// POST /api/admin/round4/open-bidding
router.post("/round4/open-bidding", async (req, res) => {
  const state = await getOrCreateState();
  if (!state.round4.currentQuestionId) {
    return res.status(400).json({ error: "Set a question before opening bidding." });
  }
  state.round4.biddingOpen = true;
  state.round4.bidsRevealed = false;
  await state.save();
  res.json({ ok: true, state });
});

// POST /api/admin/round4/close-bidding
// Closes bidding and returns all bids for this question for the live
// reveal moment, sorted highest first.
router.post("/round4/close-bidding", async (req, res) => {
  const state = await getOrCreateState();
  state.round4.biddingOpen = false;
  state.round4.bidsRevealed = true;
  await state.save();

  const questionId = state.round4.currentQuestionId;
  const participants = await Participant.find({
    "round4.bids.questionId": questionId
  });

  const bids = participants
    .map((p) => {
      const bid = p.round4.bids.find((b) => b.questionId === questionId);
      return { participantId: p._id, name: p.name, bidAmount: bid.bidAmount };
    })
    .sort((a, b) => b.bidAmount - a.bidAmount);

  res.json({ ok: true, bids, questionId });
});

// POST /api/admin/round4/resolve
// Body: { questionId, winnerParticipantId, winnerCorrect }
// Applies coin deltas: the winner either gains or loses their bid amount.
// Everyone else who bid but didn't win gets their bid amount refunded
// (since they never got to answer) — only the winner's coins are at risk.
router.post("/round4/resolve", async (req, res) => {
  try {
    const { questionId, winnerParticipantId, winnerCorrect } = req.body;

    const participants = await Participant.find({
      "round4.bids.questionId": questionId
    });

    for (const p of participants) {
      const bid = p.round4.bids.find((b) => b.questionId === questionId);
      const isWinner = String(p._id) === String(winnerParticipantId);

      if (isWinner) {
        bid.won = true;
        bid.correct = !!winnerCorrect;
        bid.coinsDelta = winnerCorrect ? bid.bidAmount : -bid.bidAmount;
        p.techCoins += bid.coinsDelta;
        if (winnerCorrect) {
          p.totalScore += bid.bidAmount;
        }
      } else {
        bid.won = false;
        bid.coinsDelta = 0; // non-winners simply never spent their bid
      }
      await p.save();
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not resolve auction round." });
  }
});

// --- Leaderboard ---

// GET /api/admin/leaderboard
router.get("/leaderboard", async (req, res) => {
  const participants = await Participant.find({ isAdmin: { $ne: true } })
    .sort({ totalScore: -1 })
    .select("name totalScore techCoins currentRound");
  res.json({ leaderboard: participants });
});

module.exports = router;
