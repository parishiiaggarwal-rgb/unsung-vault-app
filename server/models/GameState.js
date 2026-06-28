const mongoose = require("mongoose");

// Singleton document — there is exactly one GameState for the whole event.
// The admin panel reads/writes this; participants poll it to know what
// round is active and how much time is left.

const GameStateSchema = new mongoose.Schema({
  singleton: { type: String, default: "main", unique: true },

  activeRound: { type: Number, default: 0 }, // 0 = lobby, 1-4 = rounds, 5 = event over

  round1: {
    isRunning: { type: Boolean, default: false },
    startedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: 1200 } // 20 minutes
  },

  round3CaseIndex: { type: Number, default: 0 }, // which case the admin has revealed

  round4: {
    isRunning: { type: Boolean, default: false },
    currentQuestionId: { type: String, default: null },
    biddingOpen: { type: Boolean, default: false },
    bidsRevealed: { type: Boolean, default: false }
  },

  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GameState", GameStateSchema);
