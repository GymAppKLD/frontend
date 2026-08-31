import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./layout/Layout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Library from "./pages/Exercises/Library";
import Create from "./pages/Exercises/Create";
import Progress from "./pages/Exercises/Progress";
import LogWorkout from "./pages/Workouts/LogWorkout";
import WorkoutDetails from "./pages/Workouts/WorkoutDetails";
import WorkoutsList from "./pages/Workouts/WorkoutsList";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import ProgressOverview from "./pages/Progress";
import Settings from "./pages/Settings";
import Goals from "./pages/Goals/Goals";
import CreateGoal from "./pages/Goals/CreateGoal";
import GoalDetails from "./pages/Goals/GoalDetails";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workouts/log" element={<LogWorkout />} />
              <Route path="/workouts/:id" element={<WorkoutDetails />} />
              <Route path="/workouts" element={<WorkoutsList />} />
              <Route path="/exercises" element={<Library />} />
              <Route path="/exercises/create" element={<Create />} />
              <Route path="/exercises/:id/progress" element={<Progress />} />
              <Route path="/history" element={<History />} />
              <Route path="/progress" element={<ProgressOverview />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/goals/create" element={<CreateGoal />} />
              <Route path="/goals/:id" element={<GoalDetails />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;