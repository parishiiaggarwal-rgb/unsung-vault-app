const express = require("express");
const router = express.Router();
const Participant = require("../models/Participant");
const { requireAuth } = require("../middleware/auth");

// Detective-themed titles, assigned by rank position rather than score
// thresholds, so the labels stay meaningful regardless of how many
// people play or how the scoring shakes out.
function titleForRank(rank, total) {
  if (rank === 1) return "Master Detective";
  if (rank === 2) return "Senior Investigator";
  if (rank === 3) return "Intelligence Officer";
  if (rank <= Math.ceil(total * 0.5)) return "Field Detective";
  return "Junior Cadet";
}

// GET /api/leaderboard
// Public-ish (still requires login) — anyone can see standings.
router.get("/", requireAuth, async (req, res) => {
  const participants = await Participant.find({ isAdmin: { $ne: true } })
    .sort({ totalScore: -1, techCoins: -1 })
    .select("name totalScore techCoins currentRound");

  const ranked = participants.map((p, i) => ({
    rank: i + 1,
    name: p.name,
    totalScore: p.totalScore,
    techCoins: p.techCoins,
    currentRound: p.currentRound,
    title: titleForRank(i + 1, participants.length)
  }));

  res.json({ leaderboard: ranked });
});

// GET /api/leaderboard/me
// Returns just the calling participant's own standing.
router.get("/me", requireAuth, async (req, res) => {
  const participants = await Participant.find({ isAdmin: { $ne: true } }).sort({
    totalScore: -1,
    techCoins: -1
  });
  const index = participants.findIndex((p) => String(p._id) === String(req.participantId));
  if (index === -1) return res.status(404).json({ error: "Not found on leaderboard." });

  const p = participants[index];
  res.json({
    rank: index + 1,
    name: p.name,
    totalScore: p.totalScore,
    techCoins: p.techCoins,
    title: titleForRank(index + 1, participants.length)
  });
});

module.exports = router;
