import { createContext, useContext, useState, useCallback } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [participant, setParticipant] = useState(() => {
    const raw = localStorage.getItem("unsung_participant");
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback(async (name, accessCode) => {
    const res = await api.post("/auth/login", { name, accessCode });
    localStorage.setItem("unsung_token", res.data.token);
    localStorage.setItem("unsung_participant", JSON.stringify(res.data.participant));
    setParticipant(res.data.participant);
    return res.data.participant;
  }, []);

  const adminLogin = useCallback(async (adminCode) => {
    const res = await api.post("/auth/admin-login", { adminCode });
    localStorage.setItem("unsung_token", res.data.token);
    localStorage.setItem("unsung_participant", JSON.stringify(res.data.participant));
    setParticipant(res.data.participant);
    return res.data.participant;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("unsung_token");
    localStorage.removeItem("unsung_participant");
    setParticipant(null);
  }, []);

  const updateParticipant = useCallback((patch) => {
    setParticipant((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("unsung_participant", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ participant, login, adminLogin, logout, updateParticipant }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
