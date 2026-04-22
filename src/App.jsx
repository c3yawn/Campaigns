import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CampaignsHub from './pages/CampaignsHub';
import CampaignPage from './pages/CampaignPage';
import GamePage from './pages/GamePage';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/campaigns" element={<CampaignsHub />} />
        <Route path="/campaigns/:systemId/:campaignId" element={<CampaignPage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </>
  );
}
