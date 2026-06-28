const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "unsung-vault-dev-secret-change-me";

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated. Please log in again." });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.participantId = decoded.id;
    req.isAdmin = decoded.isAdmin || false;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Your session expired. Please log in again." });
  }
}

function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Admin access required for this action." });
  }
  next();
}

// Blocks eliminated participants from Round 3 / Round 4 routes. Checked
// against the DB live (not the JWT) since elimination happens dynamically
// mid-event, after the participant's token was already issued.
async function requireNotEliminated(req, res, next) {
  try {
    // Lazy require to avoid a circular dependency at module-load time.
    const Participant = require("../models/Participant");
    const participant = await Participant.findById(req.participantId).select("isEliminated");
    if (!participant) {
      return res.status(404).json({ error: "Participant not found." });
    }
    if (participant.isEliminated) {
      return res.status(403).json({
        error: "You've been eliminated from the competition and can't continue to this round.",
        eliminated: true
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Could not verify elimination status." });
  }
}

function signToken(participant) {
  return jwt.sign(
    { id: participant._id, isAdmin: participant.isAdmin || false },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

module.exports = { requireAuth, requireAdmin, requireNotEliminated, signToken, JWT_SECRET };