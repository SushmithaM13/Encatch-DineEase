import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./SuperAdminDashboard.css";
import {
  FaUsers,
  FaBars,
  FaHome,
  FaUserCircle,
  FaUtensils,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const SuperAdminDashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load hotels from localStorage
  useEffect(() => {
    const storedHotels = JSON.parse(localStorage.getItem("hotels") || "[]");
    setHotels(storedHotels);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [mobileMenuOpen]);

  const handleMobileMenuToggle = () => setMobileMenuOpen((prev) => !prev);
  const handleMobileMenuClose = () => setMobileMenuOpen(false);
  const handleDesktopSidebarToggle = () => setSidebarOpen((prev) => !prev);

  // Stats - removed staff member calculations

  return (
    <div className={`dashboard ${sidebarOpen ? "expanded" : "collapsed"}`}>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={handleMobileMenuClose}
      ></div>

      {/* Sidebar */}
      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"
        } ${mobileMenuOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <h2 className="logo">{sidebarOpen ? "Super Admin" : "SA"}</h2>
          <button className="toggle-btn" onClick={handleDesktopSidebarToggle}>
            {/* <FaBars /> */}
          </button>
        </div>
        <ul>
  <li>
    <NavLink to="/superAdminDashboard">
      <FaHome />
      {sidebarOpen && <span>Dashboard</span>}
    </NavLink>
  </li>
  <li>
    <NavLink to="/superAdminDashboard/staff">
      <FaUsers />
      {sidebarOpen && <span>Staff</span>}
    </NavLink>
  </li>
  <li>
    <NavLink to="/superAdminDashboard/staffrole">
      <FaUsers />
      {sidebarOpen && <span>Staff-role</span>}
    </NavLink>
  </li>
  <li>
    <NavLink to="/superAdminDashboard/food-items">
      <FaUtensils />
      {sidebarOpen && <span>Food Items</span>}
    </NavLink>
  </li>
  <li>
    <NavLink to="/superAdminDashboard/settings">
      <FaCog />
      {sidebarOpen && <span>Settings</span>}
    </NavLink>
  </li>
  <li>
    <NavLink to="/superAdminDashboard/logout">
      <FaSignOutAlt />
      {sidebarOpen && <span>Logout</span>}
    </NavLink>
  </li>
</ul>

      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="topbar">
          <button
            className="menu-btn"
            onClick={() => {
              if (window.innerWidth <= 768) {
                handleMobileMenuToggle();
              } else {
                handleDesktopSidebarToggle();
              }
            }}
          >
            <FaBars size={22} />
          </button>
          
          <div className="profile-info">
            <FaUserCircle size={30} className="profile-icon" />
            <span className="profile-name">Administrator</span>
          </div>
        </div>

        {/* Outlet for child routes */}
        <Outlet context={{
          hotels
        }} />
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
