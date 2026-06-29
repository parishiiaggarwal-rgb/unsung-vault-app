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

// POST /api/admin/advance-round
// Body: { round } — moves the global activeRound marker forward (2, 3, 5).
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

// DELETE /api/admin/participants/reset
// Wipes ALL non-admin participant records — full clean slate for testing.
// Does not touch the GameState (round/timer), use /admin/reset-game for that.
router.delete("/participants/reset", async (req, res) => {
  try {
    const result = await Participant.deleteMany({ isAdmin: { $ne: true } });
    res.json({ ok: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not reset participants." });
  }
});

// POST /api/admin/reset-game
// Resets the global GameState back to default, all timers cleared.
// Participants and their scores are untouched — use
// /admin/participants/reset for that.
router.post("/reset-game", async (req, res) => {
  try {
    await GameState.deleteMany({});
    const fresh = await getOrCreateState();
    res.json({ ok: true, state: fresh });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not reset game state." });
  }
});

// --- Access code generation ---

// POST /api/admin/codes/generate
// Body: { count, prefix } — creates `count` unclaimed participant records
// with auto-generated codes like DET-001, DET-002, ...
router.post("/codes/generate", async (req, res) => {
  try {
    const { count, prefix } = req.body;
    const n = Math.min(Math.max(parseInt(count, 10) || 0, 1), 200);
    const codePrefix = (prefix || "DET").toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Find the highest existing number for this prefix so re-running
    // generation doesn't collide with codes already handed out.
    const existing = await Participant.find({
      accessCode: { $regex: `^${codePrefix}-\\d+$` }
    }).select("accessCode");

    let maxNum = 0;
    existing.forEach((p) => {
      const match = p.accessCode.match(/-(\d+)$/);
      if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
    });

    const docs = [];
    for (let i = 1; i <= n; i++) {
      const num = maxNum + i;
      const code = `${codePrefix}-${String(num).padStart(3, "0")}`;
      docs.push({
        name: "Unassigned",
        accessCode: code,
        isClaimed: false
      });
    }

    const created = await Participant.insertMany(docs);
    res.json({
      ok: true,
      codes: created.map((p) => ({ accessCode: p.accessCode, id: p._id }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not generate codes." });
  }
});

// GET /api/admin/codes
// Lists all participant codes with claim status, for printing/handing out.
router.get("/codes", async (req, res) => {
  const participants = await Participant.find({ isAdmin: { $ne: true } })
    .sort({ accessCode: 1 })
    .select("name accessCode isClaimed");
  res.json({ codes: participants });
});

// DELETE /api/admin/codes/unclaimed
// Removes all never-used pre-generated codes, in case you want to
// regenerate a clean batch before the event.
router.delete("/codes/unclaimed", async (req, res) => {
  const result = await Participant.deleteMany({ isClaimed: false });
  res.json({ ok: true, deletedCount: result.deletedCount });
});

// --- Manual elimination override ---
// In case a participant abandons mid-round and the automatic "everyone
// finished" trigger never fires, the host can force elimination manually.

// POST /api/admin/elimination/force-round2
router.post("/elimination/force-round2", async (req, res) => {
  try {
    const alreadyRan = await Participant.exists({ eliminatedAfterRound: 2 });
    if (alreadyRan) {
      return res.status(409).json({ error: "Round 2 elimination has already run." });
    }
    const active = await Participant.find({ isAdmin: { $ne: true }, isEliminated: false });
    const cutoff = Math.floor(active.length / 4);
    if (cutoff === 0) {
      return res.status(400).json({ error: "Not enough active participants to eliminate 1/4." });
    }
    const round2PointsOf = (p) => p.round2.answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
    const sorted = [...active].sort((a, b) => round2PointsOf(a) - round2PointsOf(b));
    const toEliminate = sorted.slice(0, cutoff);
    await Participant.updateMany(
      { _id: { $in: toEliminate.map((p) => p._id) } },
      { isEliminated: true, eliminatedAfterRound: 2 }
    );
    res.json({ ok: true, eliminatedCount: toEliminate.length, names: toEliminate.map((p) => p.name) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not force round 2 elimination." });
  }
});

// POST /api/admin/elimination/force-round3
router.post("/elimination/force-round3", async (req, res) => {
  try {
    const alreadyRan = await Participant.exists({ eliminatedAfterRound: 3 });
    if (alreadyRan) {
      return res.status(409).json({ error: "Round 3 elimination has already run." });
    }
    const active = await Participant.find({ isAdmin: { $ne: true }, isEliminated: false });
    const cutoff = Math.floor(active.length / 4);
    if (cutoff === 0) {
      return res.status(400).json({ error: "Not enough active participants to eliminate 1/4." });
    }
    const sorted = [...active].sort((a, b) => a.totalScore - b.totalScore);
    const toEliminate = sorted.slice(0, cutoff);
    await Participant.updateMany(
      { _id: { $in: toEliminate.map((p) => p._id) } },
      { isEliminated: true, eliminatedAfterRound: 3 }
    );
    res.json({ ok: true, eliminatedCount: toEliminate.length, names: toEliminate.map((p) => p.name) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not force round 3 elimination." });
  }
});

// --- Leaderboard ---

// GET /api/admin/leaderboard
router.get("/leaderboard", async (req, res) => {
  const participants = await Participant.find({ isAdmin: { $ne: true } })
    .sort({ totalScore: -1 })
    .select("name totalScore techCoins currentRound isEliminated eliminatedAfterRound");
  res.json({ leaderboard: participants });
});

module.exports = router;