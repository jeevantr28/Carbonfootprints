import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SpaceBackground from './components/SpaceBackground';
import Dashboard from './pages/Dashboard';
import LogActivity from './pages/LogActivity';
import ActivityHistory from './pages/ActivityHistory';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <SpaceBackground />
      <div className="flex flex-col min-h-screen relative z-10">
        <Navbar />
        <main className="flex-grow pt-8 pb-16">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/log" element={
              <PrivateRoute>
                <LogActivity />
              </PrivateRoute>
            } />
            <Route path="/history" element={
              <PrivateRoute>
                <ActivityHistory />
              </PrivateRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
