import { BrowserRouter, Routes, Route } from "react-router-dom";
import Starfield from "./components/Starfield";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import EntryPage from "./pages/EntryPage";
import GalaxyPage from "./pages/GalaxyPage";
import HistoryPage from "./pages/HistoryPage";
import BadgesPage from "./pages/BadgesPage";
import QuizPage from "./pages/QuizPage";
import ChatPage from "./pages/ChatPage";

export default function App() {
  return (
    <BrowserRouter>
      {/* Animated deep space starfield canvas in background */}
      <Starfield />

      {/* Main glassmorphic HUD header navigation deck */}
      <Navbar />

      {/* Main viewport container */}
      <main className="relative z-10 w-full min-h-[85vh] pb-12">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/create" element={<EntryPage />} />
          <Route path="/galaxy" element={<GalaxyPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
