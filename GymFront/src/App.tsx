import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./layout/Layout";
import Placeholder from "./pages/Placeholder";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Placeholder title="Dashboard" subtitle="Track your performance and progression" />} />
            <Route path="/workouts" element={<Placeholder title="My Workouts" subtitle="Record, review and manage your training sessions" />} />
            <Route path="/exercises" element={<Placeholder title="Exercises" subtitle="Browse and manage your exercise library" />} />
            <Route path="/history" element={<Placeholder title="History" subtitle="Your complete training timeline" />} />
            <Route path="/progress" element={<Placeholder title="Progress" subtitle="Understand your performance over time" />} />
            <Route path="/goals" element={<Placeholder title="Goals" subtitle="Set performance targets and track your progress" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;