const mongoose = require("mongoose");

const ParticipantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    accessCode: { type: String, required: true, unique: true, trim: true },
    isClaimed: { type: Boolean, default: true }, // false = pre-generated, not yet used by a real person

    techCoins: { type: Number, default: 500 },
    totalScore: { type: Number, default: 0 },

    // Round 1 — Memory Vault
    round1: {
      startedAt: { type: Date, default: null }, // set the moment this participant logs in / first reaches round 1
      filesOpened: [{ type: String }], // personality codes opened
      completedAt: { type: Date, default: null }
    },

    // Tracks which TechCoin purchase (if any) was bought per Round 2
    // question, enforced server-side so the client can't fake discounts.
    round2Purchases: [
      {
        questionId: String,
        purchaseType: String
      }
    ],

    // Round 2 — Mystery Market
    round2: {
      answers: [
        {
          questionId: String,
          selectedIndex: Number,
          correct: Boolean,
          pointsEarned: Number,
          purchaseUsed: { type: String, default: null }, // 'hint1' | 'hint2' | 'imageReveal' | 'removeOption' | null
          doubledDown: { type: Boolean, default: false },
          answeredAt: { type: Date, default: Date.now }
        }
      ],
      completedAt: { type: Date, default: null }
    },

    // Round 3 — Case File Challenge
    round3: {
      caseResults: [
        {
          caseId: String,
          correctMatches: Number,
          totalClues: Number,
          pointsEarned: Number
        }
      ],
      completedAt: { type: Date, default: null }
    },

    // Round 4 — Master Detective Auction (kept for backward data compatibility,
    // unused since round 4 was removed from the live game)
    round4: {
      bids: [
        {
          questionId: String,
          bidAmount: Number,
          placedAt: { type: Date, default: Date.now },
          won: Boolean,
          correct: Boolean,
          selectedIndex: { type: Number, default: null },
          timedOut: { type: Boolean, default: false },
          coinsDelta: Number,
          resolvedAt: { type: Date, default: null }
        }
      ],
      completedAt: { type: Date, default: null }
    },

    currentRound: { type: Number, default: 0 }, // 0 = not started, 1-3 = active round, 5 = finished
    isAdmin: { type: Boolean, default: false },
    isEliminated: { type: Boolean, default: false },
    eliminatedAfterRound: { type: Number, default: null },

    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Participant", ParticipantSchema);