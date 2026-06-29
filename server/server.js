require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const round1Routes = require("./routes/round1");
const round2Routes = require("./routes/round2");
const round3Routes = require("./routes/round3");
const adminRoutes = require("./routes/admin");
const leaderboardRoutes = require("./routes/leaderboard");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/round1", round1Routes);
app.use("/api/round2", round2Routes);
app.use("/api/round3", round3Routes);
app.use("/api/admin", adminRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true, name: "Unsung Vault API" }));

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Unsung Vault API running on port ${PORT}`));
});