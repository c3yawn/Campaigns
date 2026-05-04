import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import CampaignsHub from './pages/CampaignsHub';
import CampaignPage from './pages/CampaignPage';
import GamePage from './pages/GamePage';
import SteamTrackerPage from './pages/SteamTrackerPage';
import AdminPage from './pages/AdminPage';
import UsernameSetupPage from './pages/UsernameSetupPage';
import ArcadiaPage from './pages/ArcadiaPage';
import WorldPage from './pages/WorldPage';
import ViviariumPage from './pages/ViviariumPage';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

function UsernameGate({ children }) {
  const { needsUsername, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (needsUsername && location.pathname !== '/setup-username') {
    return <Navigate to="/setup-username" replace />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <UsernameGate>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campaigns" element={<CampaignsHub />} />
          <Route path="/campaigns/:systemId/:campaignId" element={<CampaignPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/steam" element={<SteamTrackerPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/setup-username" element={<UsernameSetupPage />} />
          <Route path="/arcadia" element={<ArcadiaPage />} />
          <Route path="/arcadia/world/:worldId" element={<WorldPage />} />
          <Route path="/arcadia/vivarium" element={<ViviariumPage />} />
          {/* Redirects from old /creatures routes */}
          <Route path="/creatures" element={<Navigate to="/arcadia" replace />} />
          <Route path="/creatures/world/:worldId" element={<Navigate to="/arcadia" replace />} />
          <Route path="/creatures/stable" element={<Navigate to="/arcadia/vivarium" replace />} />
        </Routes>
      </UsernameGate>
    </>
  );
}
