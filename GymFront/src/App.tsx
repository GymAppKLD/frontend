import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./layout/Layout";
import Library from "./pages/Exercises/Library";
import Create from "./pages/Exercises/Create";
import Progress from "./pages/Exercises/Progress";
import LogWorkout from "./pages/Workouts/LogWorkout";
import WorkoutDetails from "./pages/Workouts/WorkoutDetails";
import WorkoutsList from "./pages/Workouts/WorkoutsList";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./pages/Placeholder";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workouts/log" element={<LogWorkout />} />
            <Route path="/workouts/:id" element={<WorkoutDetails />} />
            <Route path="/workouts" element={<WorkoutsList />} />
            <Route path="/exercises" element={<Library />} />
            <Route path="/exercises/create" element={<Create />} />
            <Route path="/exercises/:id/progress" element={<Progress />} />
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