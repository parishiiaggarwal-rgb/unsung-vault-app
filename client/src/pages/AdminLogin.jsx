import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!adminCode.trim()) {
      setError("Enter the admin code.");
      return;
    }
    setLoading(true);
    try {
      await adminLogin(adminCode.trim());
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.error || "Incorrect admin code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "6vh 6vw"
      }}
    >
      <p className="section-label">Restricted access</p>
      <h2 style={{ fontSize: 26, marginBottom: 28 }}>Event host login</h2>
      <form
        onSubmit={handleSubmit}
        style={{ width: "min(340px, 88vw)", display: "flex", flexDirection: "column", gap: 14 }}
      >
        {error && <div className="error-banner">{error}</div>}
        <input
          placeholder="Admin code"
          value={adminCode}
          onChange={(e) => setAdminCode(e.target.value)}
          type="password"
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Unlock host panel"}
        </button>
      </form>
      <button className="btn ghost small" style={{ marginTop: 30 }} onClick={() => navigate("/")}>
        Back to vault entrance
      </button>
    </div>
  );
}
