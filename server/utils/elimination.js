const Participant = require("../models/Participant");

function round2PointsOf(participant) {
  return participant.round2.answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
}

// Runs after every Round 2 completion. If every still-active (non-eliminated,
// non-admin) participant has finished Round 2, eliminates the bottom 1/4 by
// POINTS EARNED IN ROUND 2 (not total score, not TechCoins). Idempotent —
// if elimination already ran (anyone has eliminatedAfterRound === 2), it
// won't run again.
async function maybeRunRound2Elimination() {
  const alreadyRan = await Participant.exists({ eliminatedAfterRound: 2 });
  if (alreadyRan) return { ranNow: false };

  const active = await Participant.find({ isAdmin: { $ne: true }, isEliminated: false });
  if (active.length === 0) return { ranNow: false };

  const allFinished = active.every((p) => p.round2.completedAt);
  if (!allFinished) return { ranNow: false };

  const cutoff = Math.floor(active.length / 4);
  if (cutoff === 0) return { ranNow: false, eliminatedCount: 0 };

  const sorted = [...active].sort((a, b) => round2PointsOf(a) - round2PointsOf(b));
  const toEliminate = sorted.slice(0, cutoff);

  await Participant.updateMany(
    { _id: { $in: toEliminate.map((p) => p._id) } },
    { isEliminated: true, eliminatedAfterRound: 2 }
  );

  return { ranNow: true, eliminatedCount: toEliminate.length };
}

// Same pattern after Round 3, ranking by TOTAL SCORE (points across rounds
// 2 + 3 combined) among whoever is still active (i.e. survived round 2's cut).
async function maybeRunRound3Elimination() {
  const alreadyRan = await Participant.exists({ eliminatedAfterRound: 3 });
  if (alreadyRan) return { ranNow: false };

  const active = await Participant.find({ isAdmin: { $ne: true }, isEliminated: false });
  if (active.length === 0) return { ranNow: false };

  const allFinished = active.every((p) => p.round3.completedAt);
  if (!allFinished) return { ranNow: false };

  const cutoff = Math.floor(active.length / 4);
  if (cutoff === 0) return { ranNow: false, eliminatedCount: 0 };

  const sorted = [...active].sort((a, b) => a.totalScore - b.totalScore);
  const toEliminate = sorted.slice(0, cutoff);

  await Participant.updateMany(
    { _id: { $in: toEliminate.map((p) => p._id) } },
    { isEliminated: true, eliminatedAfterRound: 3 }
  );

  return { ranNow: true, eliminatedCount: toEliminate.length };
}

module.exports = { maybeRunRound2Elimination, maybeRunRound3Elimination };