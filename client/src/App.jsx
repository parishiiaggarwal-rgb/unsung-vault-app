import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RequireParticipant, RequireAdmin } from "./components/RouteGuards";

import Landing from "./pages/Landing";
import Lobby from "./pages/Lobby";
import Round1 from "./pages/Round1";
import Round2 from "./pages/Round2";
import Round3 from "./pages/Round3";
import Round4 from "./pages/Round4";
import Leaderboard from "./pages/Leaderboard";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          <Route
            path="/lobby"
            element={
              <RequireParticipant>
                <Lobby />
              </RequireParticipant>
            }
          />
          <Route
            path="/round1"
            element={
              <RequireParticipant>
                <Round1 />
              </RequireParticipant>
            }
          />
          <Route
            path="/round2"
            element={
              <RequireParticipant>
                <Round2 />
              </RequireParticipant>
            }
          />
          <Route
            path="/round3"
            element={
              <RequireParticipant>
                <Round3 />
              </RequireParticipant>
            }
          />
          <Route
            path="/round4"
            element={
              <RequireParticipant>
                <Round4 />
              </RequireParticipant>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <RequireParticipant>
                <Leaderboard />
              </RequireParticipant>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPanel />
              </RequireAdmin>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
