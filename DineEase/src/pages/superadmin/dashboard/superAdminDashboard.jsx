import React, { useState, useEffect, useRef } from "react";
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
  FaIdBadge,
} from "react-icons/fa";

const SuperAdminDashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`dashboard ${sidebarOpen ? "expanded" : "collapsed"}`}>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={handleMobileMenuClose}
      >
      </div>
      {/* Sidebar */}
      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"
        } ${mobileMenuOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <h2 className="logo">{sidebarOpen ? "DINE _ EASE" : ""}</h2>
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

          {/* Profile Dropdown */}
          <div className="profile-info" ref={dropdownRef}>
            <div
              className="profile-trigger"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <FaUserCircle size={30} className="profile-icon" />
              <span className="profile-name">SuperAdmin</span>
            </div>

            {dropdownOpen && (
              <div className="profile-dropdown">
                <button>
                  <FaIdBadge /> Profile
                </button>
                <button>
                  <FaCog /> Settings
                </button>
                <button className="logout-btn">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Outlet for child routes */}
        <Outlet
          context={{
            hotels,
          }}
        />
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
