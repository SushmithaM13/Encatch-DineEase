import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import SuperAdminRegistration from './components/super/SuperAdminRegistration';
import Footer from "./components/footer/Footer"

// Dashboard component (placeholder)
const Dashboard = () => (
  <div className="page-content">
    <h2>WELCOME TO DASHBOARD 🎉</h2>
    <p>This is your dashboard main area. Add cards, charts, or tables here.</p>
  </div>
);

// Other page components (placeholders)
const Orders = () => (
  <div className="page-content">
    <h2>Orders</h2>
    <p>Order management interface goes here.</p>
  </div>
);

const Customers = () => (
  <div className="page-content">
    <h2>Customers</h2>
    <p>Customer management interface goes here.</p>
  </div>
);

const Analytics = () => (
  <div className="page-content">
    <h2>Analytics</h2>
    <p>Analytics and reports go here.</p>
  </div>
);

const Settings = () => (
  <div className="page-content">
    <h2>Settings</h2>
    <p>Application settings go here.</p>
  </div>
);

// Login component (placeholder)
const Login = () => (
  <div className="login-page">
    <h2>Login</h2>
    <p>Login form would go here.</p>
  </div>
);

// Main App component with routing
const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="App">
      <Navbar onToggleSidebar={toggleSidebar} />
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
      />

      <main className="main-content with-navbar">
        <Routes>
          <Route path="/" element={<SuperAdminRegistration />} />
          <Route path="/register" element={<SuperAdminRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        
      </main>
       <Footer />  
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
