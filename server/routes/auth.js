const express = require("express");
const router = express.Router();
const Participant = require("../models/Participant");
const { signToken } = require("../middleware/auth");

// POST /api/auth/login
// Body: { name, accessCode }
// If the access code doesn't exist yet, a new participant is created with
// that name + code (so the admin can pre-print codes on cards and hand
// them out, or just let people pick their own code at the door).
router.post("/login", async (req, res) => {
  try {
    const { name, accessCode } = req.body;
    if (!name || !accessCode) {
      return res.status(400).json({ error: "Enter your name and access code." });
    }
    const cleanCode = accessCode.trim().toUpperCase();

    let participant = await Participant.findOne({ accessCode: cleanCode });

    if (!participant) {
      // Unknown code — create a fresh participant on the spot (lets people
      // make up their own code at the door if you're not pre-printing them).
      // currentRound starts at 1 and their personal Round 1 timer starts
      // right now — no lobby wait, no admin start button needed.
      participant = await Participant.create({
        name: name.trim(),
        accessCode: cleanCode,
        isClaimed: true,
        currentRound: 1,
        round1: { startedAt: new Date() }
      });
    } else if (!participant.isClaimed) {
      // Pre-generated code, first time anyone has used it — claim it with
      // this person's real name and start their personal timer now.
      participant.name = name.trim();
      participant.isClaimed = true;
      participant.currentRound = 1;
      participant.round1.startedAt = new Date();
      await participant.save();
    } else if (participant.name !== name.trim()) {
      // Already claimed by someone else's name — don't silently overwrite.
      return res.status(409).json({
        error: "That access code is already registered to a different name. Check your code and try again."
      });
    }
    // Note: returning participants (already claimed, matching name) keep
    // whatever round/timer state they already had — re-logging in does
    // NOT reset their Round 1 clock.

    const token = signToken(participant);
    res.json({
      token,
      participant: {
        id: participant._id,
        name: participant.name,
        techCoins: participant.techCoins,
        totalScore: participant.totalScore,
        currentRound: participant.currentRound,
        isAdmin: participant.isAdmin
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed. Try again in a moment." });
  }
});

// POST /api/auth/admin-login
// Body: { adminCode }
// Single shared admin code, set via env var. Logs in (or creates) the
// admin participant record so the host has their own JWT.
router.post("/admin-login", async (req, res) => {
  try {
    const { adminCode } = req.body;
    const expected = process.env.ADMIN_CODE || "VAULT-ADMIN";
    if (!adminCode || adminCode !== expected) {
      return res.status(401).json({ error: "Incorrect admin code." });
    }

    let admin = await Participant.findOne({ accessCode: "ADMIN-HOST" });
    if (!admin) {
      admin = await Participant.create({
        name: "Event Host",
        accessCode: "ADMIN-HOST",
        isAdmin: true
      });
    }

    const token = signToken(admin);
    res.json({ token, participant: { id: admin._id, name: admin.name, isAdmin: true } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Admin login failed." });
  }
});

module.exports = router;