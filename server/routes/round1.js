const express = require("express");
const router = express.Router();
const Participant = require("../models/Participant");
const personalities = require("../data/personalities");
const { requireAuth } = require("../middleware/auth");

// GET /api/round1/files
// Returns the public-facing dossier data (no answer keys) for the grid.
// Names are always shown in full — no redaction mechanic.
router.get("/files", requireAuth, async (req, res) => {
  const files = personalities.map((p) => ({
    code: p.code,
    name: p.name,
    era: p.era,
    field: p.field,
    achievement: p.achievement,
    fact: p.fact,
    quote: p.quote,
    isRedacted: false
  }));
  res.json({ files });
});

// POST /api/round1/open
// Body: { code } — marks a file as opened (for progress tracking only,
// does not gate anything since the participant can re-open freely
// within the timer window).
router.post("/open", requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    const valid = personalities.some((p) => p.code === code);
    if (!valid) return res.status(400).json({ error: "Unknown file code." });

    await Participant.findByIdAndUpdate(req.participantId, {
      $addToSet: { "round1.filesOpened": code }
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Could not record progress." });
  }
});

// POST /api/round1/complete
// Marks Round 1 as finished for this participant (called when their
// local timer hits zero, or they manually submit).
router.post("/complete", requireAuth, async (req, res) => {
  try {
    const participant = await Participant.findByIdAndUpdate(
      req.participantId,
      {
        "round1.completedAt": new Date(),
        currentRound: 2
      },
      { new: true }
    );
    res.json({ ok: true, currentRound: participant.currentRound });
  } catch (err) {
    res.status(500).json({ error: "Could not complete round 1." });
  }
});

// GET /api/round1/status
// Returns THIS participant's personal Round 1 timer — their own clock
// started the moment they first logged in, independent of everyone else.
router.get("/status", requireAuth, async (req, res) => {
  const participant = await Participant.findById(req.participantId).select("round1");
  if (!participant) return res.status(404).json({ error: "Participant not found." });

  res.json({
    round1: {
      startedAt: participant.round1.startedAt,
      durationSeconds: 1200,
      isRunning: !!participant.round1.startedAt && !participant.round1.completedAt
    }
  });
});

module.exports = router;