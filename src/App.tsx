import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Feedback from './pages/Feedback';
import HealthAnalyzer from './pages/HealthAnalyzer';
import HealthReport from './pages/HealthReport';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';
import DietPlanner from './pages/DietPlanner';
import Reminders from './pages/Reminders';
import LiveHealthView from './pages/LiveHealthView';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { StorageProvider } from './context/StorageContext';
import { Toaster } from './components/ui/sonner';
import FloatingChatbot from './components/FloatingChatbot';
import { useStorage } from './context/StorageContext';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <StorageProvider>
        <ThemeProvider>
          <AuthProvider>
            <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/analyze" element={<ProtectedRoute><HealthAnalyzer /></ProtectedRoute>} />
              <Route path="/report/:id" element={<ProtectedRoute><HealthReport /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/diet-planner/:reportId?" element={<ProtectedRoute><DietPlanner /></ProtectedRoute>} />
              <Route path="/planner/:id" element={<ProtectedRoute><DietPlanner /></ProtectedRoute>} />
              <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
              <Route path="/live/:id" element={<LiveHealthView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <FloatingChatbot />
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
      </StorageProvider>
    </ErrorBoundary>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const storage = useStorage();
  const isAuthenticated = storage.getItem('user');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default App;
