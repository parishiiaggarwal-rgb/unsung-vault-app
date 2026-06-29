const express = require("express");
const router = express.Router();
const Participant = require("../models/Participant");
const cases = require("../data/cases");
const personalities = require("../data/personalities");
const { requireAuth, requireNotEliminated } = require("../middleware/auth");
const { maybeRunRound3Elimination } = require("../utils/elimination");

const POINTS_PER_CORRECT_MATCH = 15;

// GET /api/round3/cases
// Returns cases with clues shuffled (server doesn't reveal correctCode
// or isRedHerring), plus the personality options for that case.
router.get("/cases", requireAuth, requireNotEliminated, async (req, res) => {
  const safe = cases.map((c) => {
    const options = c.personalityCodes.map((code) => {
      const p = personalities.find((p) => p.code === code);
      return { code, name: p.name, field: p.field };
    });
    const clues = c.clues.map((clue) => ({ id: clue.id, text: clue.text }));
    return { id: c.id, title: c.title, options, clues };
  });
  res.json({ cases: safe });
});

// POST /api/round3/submit
// Body: { caseId, matches: [{ clueId, assignedCode }] }
// assignedCode can be null/omitted if the participant decided a clue is
// a red herring and assigned it to nobody.
router.post("/submit", requireAuth, requireNotEliminated, async (req, res) => {
  try {
    const { caseId, matches } = req.body;
    const caseData = cases.find((c) => c.id === caseId);
    if (!caseData) return res.status(400).json({ error: "Unknown case." });

    const participant = await Participant.findById(req.participantId);
    if (!participant) return res.status(404).json({ error: "Participant not found." });

    const already = participant.round3.caseResults.find((r) => r.caseId === caseId);
    if (already) return res.status(409).json({ error: "You've already submitted this case." });

    let correctMatches = 0;
    const results = caseData.clues.map((clue) => {
      const submitted = (matches || []).find((m) => m.clueId === clue.id);
      const assignedCode = submitted ? submitted.assignedCode : null;

      let isCorrect;
      if (clue.isRedHerring) {
        isCorrect = !assignedCode; // correct only if left unassigned
      } else {
        isCorrect = assignedCode === clue.correctCode;
      }
      if (isCorrect) correctMatches += 1;

      return {
        clueId: clue.id,
        correctCode: clue.correctCode,
        isRedHerring: !!clue.isRedHerring,
        assignedCode,
        isCorrect
      };
    });

    const pointsEarned = correctMatches * POINTS_PER_CORRECT_MATCH;

    participant.round3.caseResults.push({
      caseId,
      correctMatches,
      totalClues: caseData.clues.length,
      pointsEarned
    });
    participant.totalScore += pointsEarned;
    await participant.save();

    res.json({
      ok: true,
      correctMatches,
      totalClues: caseData.clues.length,
      pointsEarned,
      totalScore: participant.totalScore,
      results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not submit case." });
  }
});

// POST /api/round3/complete
router.post("/complete", requireAuth, async (req, res) => {
  try {
    await Participant.findByIdAndUpdate(req.participantId, {
      "round3.completedAt": new Date(),
      currentRound: 5 // 5 = finished, no round 4 anymore — straight to leaderboard
    });

    const eliminationResult = await maybeRunRound3Elimination();

    const refreshed = await Participant.findById(req.participantId);

    res.json({
      ok: true,
      currentRound: refreshed.currentRound,
      isEliminated: refreshed.isEliminated,
      eliminationRanNow: eliminationResult.ranNow
    });
  } catch (err) {
    res.status(500).json({ error: "Could not complete round 3." });
  }
});

module.exports = router;