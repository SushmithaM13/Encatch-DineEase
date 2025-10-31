import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
  FaTable,
  FaFolder,
  FaPlusCircle,
  FaTags,
  FaPuzzlePiece,
  FaMagic,
  
  
} from "react-icons/fa";

const SuperAdminDashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Menu dropdown options (from MenuDashboard)
  const menuOptions = [
    { path: "/superAdminDashboard/Menu/category", label: "Add Category", icon: <FaFolder /> },
    { path: "/superAdminDashboard/Menu/item", label: "Add Item", icon: <FaPlusCircle /> },
    { path: "/superAdminDashboard/Menu/food", label: "Food type", icon: <FaUtensils  /> },
     { path: "/superAdminDashboard/Menu/cuisine", label: "Cuisine type", icon: <FaBars  /> },
    { path: "/superAdminDashboard/Menu/variant", label: "Add Variant", icon: <FaTags /> },
    { path: "/superAdminDashboard/Menu/addon", label: "Add Addon", icon: <FaPuzzlePiece /> },
    { path: "/superAdminDashboard/Menu/customization", label: "Customization Group", icon: <FaMagic /> },
  ];

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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent back button from going to login when logged in
  useEffect(() => {
    const handlePopState = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (token && role === "SUPER_ADMIN") {
        window.history.pushState(null, null, window.location.pathname);
      }
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // ✅ Logout function with API call
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        "http://localhost:8082/dine-ease/api/v1/users/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Logout failed");

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ✅ Close sidebar in mobile view when a link is clicked
  useEffect(() => {
    const links = document.querySelectorAll(".sidebar ul li a");
    links.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          document.querySelector(".sidebar").classList.remove("mobile-open");
          document.querySelector(".sidebar-overlay").classList.remove("active");
        }
      });
    });
  }, []);

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
          <FaUtensils size={22} />
          <h2 className="logo">{sidebarOpen ? "DINE _ EASE" : "DE"}</h2>
          <button className="toggle-btn" onClick={handleDesktopSidebarToggle}></button>
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

          {/* ✅ Menu Dashboard with hover dropdown */}
          <li
            className="menu-dropdown"
            onMouseEnter={() => setMenuDropdownOpen(true)}
            onMouseLeave={() => setMenuDropdownOpen(false)}
          >
            <NavLink to="/superAdminDashboard/Menu">
              <FaUtensils />
              {sidebarOpen && <span>Menu Dashboard</span>}
            </NavLink>

            {menuDropdownOpen && sidebarOpen && (
              <ul className="submenu">
                {menuOptions.map((option) => (
                  <li key={option.path}>
                    <NavLink to={option.path}>
                      {option.icon}
                      <span>{option.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li>
            <NavLink to="/superAdminDashboard/table">
              <FaTable />
              {sidebarOpen && <span>Table Management</span>}
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

          <div className="dashboard-header">
            <h1>Super Admin Dashboard</h1>
          </div>

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
                <button onClick={() => navigate("/superAdminDashboard/profile")}>
                  <FaIdBadge /> Profile
                </button>
                <button onClick={() => navigate("/superAdminDashboard/settings")}>
                  <FaCog /> Settings
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Outlet for child routes */}
        <Outlet context={{ hotels }} />
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
