import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UserInfo from "./pages/UserInfo.jsx";
import DietPage from "./pages/DietPage.jsx"; 
import WorkoutPage from "./pages/WorkoutPage.jsx";
import Profile from "./pages/Profile.jsx";
import SidebarLayout from "./components/SidebarLayout.jsx";
import ExerciseGuide from './pages/ExerciseGuide';
import DailyCheckInModal from "./components/DailyCheckInModal.jsx";

// Protected Layout Wrapper Component
const ProtectedLayout = () => {
  return (
    <SidebarLayout>
      <DailyCheckInModal />
      <Outlet />
    </SidebarLayout>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        
        {/* PUBLIC ONBOARDING ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/user-info" element={<UserInfo />} />

        {/* CORE FITNESS HUB INTERACTIVE SYSTEM (Wrapped in Layout) */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/exercises" element={<ExerciseGuide />} />
          <Route path="/diet" element={<DietPage />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* CATCH-ALL REDIRECT */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        
      </Routes>
    </Router>
  );
}

export default App;