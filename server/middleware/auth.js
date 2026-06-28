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

function signToken(participant) {
  return jwt.sign(
    { id: participant._id, isAdmin: participant.isAdmin || false },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

module.exports = { requireAuth, requireAdmin, signToken, JWT_SECRET };
