const express = require("express");
const router = express.Router();
const Participant = require("../models/Participant");
const GameState = require("../models/GameState");
const questions = require("../data/questions");
const { requireAuth, requireAdmin, requireNotEliminated } = require("../middleware/auth");

// Round 4 reuses the question bank (admin picks which questions to use
// live) but the mechanic is different: participants bid coins for the
// right to answer, not just pick an option.
//
// Flow (driven by admin via /api/admin routes):
//   1. Admin sets currentQuestionId, opens bidding (biddingOpen = true)
//   2. Each participant submits a bid (in_memory + persisted on their doc)
//   3. Admin closes bidding, reveals — at that point the HIGHEST bidder
//      gets to answer (in a real room, that's spoken aloud / shown on a
//      shared screen). This route lets the admin fetch all bids for the
//      reveal moment, then resolve win/loss coin deltas once the answer
//      is known.

// GET /api/round4/current
// Participants poll this to see the live question + whether bidding is open.
router.get("/current", requireAuth, async (req, res) => {
  let state = await GameState.findOne({ singleton: "main" });
  if (!state) state = await GameState.create({ singleton: "main" });

  const question = state.round4.currentQuestionId
    ? questions.find((q) => q.id === state.round4.currentQuestionId)
    : null;

  res.json({
    biddingOpen: state.round4.biddingOpen,
    bidsRevealed: state.round4.bidsRevealed,
    question: question
      ? { id: question.id, prompt: question.prompt, options: question.options }
      : null
  });
});

// POST /api/round4/bid
// Body: { questionId, bidAmount }
// Stores the bid as "pending" — not deducted yet, since the bid is only
// charged/awarded once the admin resolves the round (win or lose).
router.post("/bid", requireAuth, requireNotEliminated, async (req, res) => {
  try {
    const { questionId, bidAmount } = req.body;
    const participant = await Participant.findById(req.participantId);
    if (!participant) return res.status(404).json({ error: "Participant not found." });

    if (bidAmount < 0 || bidAmount > participant.techCoins) {
      return res.status(400).json({ error: "Bid must be between 0 and your current TechCoin balance." });
    }

    const state = await GameState.findOne({ singleton: "main" });
    if (!state || !state.round4.biddingOpen || state.round4.currentQuestionId !== questionId) {
      return res.status(409).json({ error: "Bidding isn't open for this question right now." });
    }

    const existing = participant.round4.bids.find((b) => b.questionId === questionId);
    if (existing) {
      return res.status(409).json({ error: "You've already placed a bid on this question." });
    }

    // Stored with won/correct/coinsDelta unresolved (null/0) until the
    // admin reveals and resolves the outcome.
    participant.round4.bids.push({
      questionId,
      bidAmount,
      won: false,
      correct: false,
      coinsDelta: 0
    });
    await participant.save();

    res.json({ ok: true, bidAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not place bid." });
  }
});

// GET /api/round4/my-result/:questionId
// Lets a participant check whether their bid for a question has been
// resolved yet, and what happened.
router.get("/my-result/:questionId", requireAuth, async (req, res) => {
  const participant = await Participant.findById(req.participantId);
  if (!participant) return res.status(404).json({ error: "Participant not found." });
  const bid = participant.round4.bids.find((b) => b.questionId === req.params.questionId);
  if (!bid) return res.status(404).json({ error: "No bid found for this question." });
  res.json({ bid, techCoins: participant.techCoins, totalScore: participant.totalScore });
});

module.exports = router;