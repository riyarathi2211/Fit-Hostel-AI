import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

function App() {
  return (
    <Router>
      <Routes>
        
        {/* PUBLIC ONBOARDING SEQUENCES (No Sidebar & No Check-in) */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/user-info" element={<UserInfo />} />

        {/* CORE FITNESS HUB INTERACTIVE SYSTEM (Wrapped safely in SidebarLayout) */}
        <Route 
          path="/dashboard" 
          element={
            <SidebarLayout>
              <DailyCheckInModal />
              <Dashboard />
            </SidebarLayout>
          } 
        />
        
        <Route 
          path="/workout" 
          element={
            <SidebarLayout>
              <DailyCheckInModal />
              <WorkoutPage />
            </SidebarLayout>
          } 
        />

        {/* EXERCISE GUIDE ROUTE */}
        <Route 
          path="/exercises" 
          element={
            <SidebarLayout>
              <DailyCheckInModal />
              <ExerciseGuide />
            </SidebarLayout>
          } 
        />
        
        <Route 
          path="/diet" 
          element={
            <SidebarLayout>
              <DailyCheckInModal />
              <DietPage />
            </SidebarLayout>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <SidebarLayout>
              <DailyCheckInModal />
              <Profile />
            </SidebarLayout>
          } 
        />

        {/* CATCH-ALL PROTECTION BLOCK */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        
      </Routes>
    </Router>
  );
}

export default App;