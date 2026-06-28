const express = require("express");
const router = express.Router();
const Participant = require("../models/Participant");
const questions = require("../data/questions");
const personalities = require("../data/personalities");
const { requireAuth } = require("../middleware/auth");
const { maybeRunRound2Elimination } = require("../utils/elimination");

const PRICES = {
  hint1: 20,
  hint2: 20,
  imageReveal: 30,
  removeOption: 40
};

// GET /api/round2/questions
// Returns questions WITHOUT answer keys, in fixed order.
router.get("/questions", requireAuth, async (req, res) => {
  const safe = questions.map((q) => ({
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    options: q.options,
    points: q.points
  }));
  res.json({ questions: safe, prices: PRICES });
});

function buildHint(question, level) {
  const personality = personalities.find((p) => question.personalityCodes.includes(p.code));
  if (!personality) return "No hint available.";
  if (level === 1) return `Field of work: ${personality.field}.`;
  return `Era: ${personality.era}. Known fact: ${personality.fact}`;
}

function pickWrongOptionToRemove(question) {
  const wrongIndexes = question.options
    .map((_, i) => i)
    .filter((i) => i !== question.answerIndex);
  return wrongIndexes[Math.floor(Math.random() * wrongIndexes.length)];
}

function buildPurchasePayload(question, purchaseType) {
  if (purchaseType === "hint1") return { hint: buildHint(question, 1) };
  if (purchaseType === "hint2") return { hint: buildHint(question, 2) };
  if (purchaseType === "imageReveal") {
    const personality = personalities.find((p) => question.personalityCodes.includes(p.code));
    return {
      imageDescription: personality
        ? `Archive photo on file: era ${personality.era}, field of work — ${personality.field}.`
        : "No archive image available for this case."
    };
  }
  if (purchaseType === "removeOption") {
    return { removedIndex: pickWrongOptionToRemove(question) };
  }
  return {};
}

// POST /api/round2/purchase
// Body: { questionId, purchaseType }
// purchaseType: 'hint1' | 'hint2' | 'imageReveal' | 'removeOption'
// Rules:
//  - Only one purchase TYPE allowed per question. Re-requesting the same
//    type again doesn't re-charge (idempotent, e.g. for client retries).
//  - Requesting a different type after one was already bought is rejected.
//  - Blocked once the question has already been answered.
router.post("/purchase", requireAuth, async (req, res) => {
  try {
    const { questionId, purchaseType } = req.body;
    const price = PRICES[purchaseType];
    if (!price) return res.status(400).json({ error: "Unknown purchase type." });

    const question = questions.find((q) => q.id === questionId);
    if (!question) return res.status(400).json({ error: "Unknown question." });

    const participant = await Participant.findById(req.participantId);
    if (!participant) return res.status(404).json({ error: "Participant not found." });

    const alreadyAnswered = participant.round2.answers.find((a) => a.questionId === questionId);
    if (alreadyAnswered) {
      return res.status(409).json({ error: "You've already answered this question." });
    }

    const existingPurchase = participant.round2Purchases.find((p) => p.questionId === questionId);

    if (existingPurchase && existingPurchase.purchaseType !== purchaseType) {
      return res.status(409).json({
        error: `You already bought "${existingPurchase.purchaseType}" for this question. Only one purchase per question is allowed.`
      });
    }

    if (existingPurchase) {
      // Same type re-requested — don't charge twice, just re-serve it.
      return res.json({
        ok: true,
        techCoins: participant.techCoins,
        purchaseType,
        payload: buildPurchasePayload(question, purchaseType),
        alreadyOwned: true
      });
    }

    if (participant.techCoins < price) {
      return res.status(402).json({ error: "Not enough TechCoins for that purchase." });
    }

    participant.techCoins -= price;
    participant.round2Purchases.push({ questionId, purchaseType });
    await participant.save();

    res.json({
      ok: true,
      techCoins: participant.techCoins,
      purchaseType,
      payload: buildPurchasePayload(question, purchaseType)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Purchase failed." });
  }
});

// POST /api/round2/answer
// Body: { questionId, selectedIndex, doubledDown }
// selectedIndex can be null — this represents a timeout (the 1-minute
// per-question timer ran out with nothing selected). A null/missing
// selectedIndex is always scored as incorrect, same as a wrong guess.
// purchaseUsed is read from the server-tracked round2Purchases, not the
// client body, so a participant can't claim a discount/hint they didn't
// actually pay for.
router.post("/answer", requireAuth, async (req, res) => {
  try {
    const { questionId, selectedIndex, doubledDown } = req.body;
    const question = questions.find((q) => q.id === questionId);
    if (!question) return res.status(400).json({ error: "Unknown question." });

    const participant = await Participant.findById(req.participantId);
    if (!participant) return res.status(404).json({ error: "Participant not found." });

    const already = participant.round2.answers.find((a) => a.questionId === questionId);
    if (already) return res.status(409).json({ error: "You've already answered this question." });

    const purchaseRecord = participant.round2Purchases.find((p) => p.questionId === questionId);
    const purchaseUsed = purchaseRecord ? purchaseRecord.purchaseType : null;

    const hasSelection = typeof selectedIndex === "number";
    const correct = hasSelection && selectedIndex === question.answerIndex;
    let pointsEarned = 0;
    if (correct) {
      pointsEarned = doubledDown ? Math.round(question.points * 1.5) : question.points;
    }

    participant.round2.answers.push({
      questionId,
      selectedIndex: hasSelection ? selectedIndex : null,
      correct,
      pointsEarned,
      purchaseUsed,
      doubledDown: !!doubledDown
    });
    participant.totalScore += pointsEarned;
    await participant.save();

    res.json({
      ok: true,
      correct,
      pointsEarned,
      correctIndex: question.answerIndex,
      totalScore: participant.totalScore,
      techCoins: participant.techCoins
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not submit answer." });
  }
});

// POST /api/round2/complete
router.post("/complete", requireAuth, async (req, res) => {
  try {
    const participant = await Participant.findByIdAndUpdate(
      req.participantId,
      { "round2.completedAt": new Date(), currentRound: 3 },
      { new: true }
    );

    const eliminationResult = await maybeRunRound2Elimination();

    // Re-fetch in case this participant themselves got eliminated by the
    // run that just happened.
    const refreshed = await Participant.findById(req.participantId);

    res.json({
      ok: true,
      currentRound: refreshed.currentRound,
      isEliminated: refreshed.isEliminated,
      eliminationRanNow: eliminationResult.ranNow
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not complete round 2." });
  }
});

module.exports = router;