import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import SoupIcon from "./SoupIcon";
import "./SuperAdminDashboard.css";
import {
  FaUsers,
  FaBars,
  FaHome,
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
  FaSearch,
  FaChevronRight,
  FaChartBar,
  FaFileAlt,
} from "react-icons/fa";

const SuperAdminDashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);

  const [userName, setUserName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationFullName, setOrganizationFullName] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const dashboardOptions = [
    { path: "/superAdminDashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/superAdminDashboard/Analytics", label: "Analytics", icon: <FaChartBar /> },
    { path: "/superAdminDashboard/reports", label: "Reports", icon: <FaFileAlt /> },
    { path: "/superAdminDashboard/settings", label: "Settings", icon: <FaCog /> },
  ];

  const menuOptions = [
    { path: "/superAdminDashboard/AddMenu-form", label: "Menu List", icon: <FaUtensils /> },
    { path: "/superAdminDashboard/category-form", label: "Add Category", icon: <FaFolder /> },
    { path: "/superAdminDashboard/add-item-type", label: "Add Item", icon: <FaPlusCircle /> },
    { path: "/superAdminDashboard/food-type", label: "Food Type", icon: <FaUtensils /> },
    { path: "/superAdminDashboard/cuisine-type", label: "Cuisine Type", icon: <FaBars /> },
    { path: "/superAdminDashboard/addon-form", label: "Add Addon", icon: <FaPuzzlePiece /> },
    { path: "/superAdminDashboard/customization-group-form", label: "Customization Group", icon: <FaMagic /> },
  ];

  useEffect(() => {
    // Load data once
    try {
      const storedHotels = JSON.parse(localStorage.getItem("hotels") || "[]");
      setHotels(storedHotels);
    } catch {
      setHotels([]);
    }

    // User name load
    const updatedFullName = localStorage.getItem("superAdminFullName");
    if (updatedFullName && updatedFullName !== "null" && updatedFullName !== "undefined") {
      setUserName(updatedFullName);
    } else {
      const userRaw = localStorage.getItem("user");
      const userObj = userRaw && userRaw !== "undefined" ? JSON.parse(userRaw) : {};
      setUserName(userObj?.name || "User");
    }

    // Organization load
    const storedOrgRaw = localStorage.getItem("organization");
    if (storedOrgRaw) {
      const org = JSON.parse(storedOrgRaw);
      setOrganizationName(org.name || "");
      setOrganizationFullName(org.fullName || "");
    }

    // Fallback
    const orgName = localStorage.getItem("organizationName");
    const orgFull = localStorage.getItem("organizationFullName");

    if (orgName) setOrganizationName(orgName);
    if (orgFull) setOrganizationFullName(orgFull);

    // Listeners for dynamic update
    const handleNameUpdate = () => {
      const newName = localStorage.getItem("superAdminFullName") || "User";
      setUserName(newName);
    };

    const handleOrgUpdate = () => {
      const newOrgName = localStorage.getItem("organizationName") || "";
      const newOrgFullName = localStorage.getItem("organizationFullName") || "";
      setOrganizationName(newOrgName);
      setOrganizationFullName(newOrgFullName);
    };

    window.addEventListener("superAdminNameUpdated", handleNameUpdate);
    window.addEventListener("organizationUpdated", handleOrgUpdate);

    const handleStorage = (e) => {
      if (e.key === "superAdminFullName") {
        setUserName(e.newValue || "User");
      }
      if (e.key === "organizationName") {
        setOrganizationName(e.newValue || "");
      }
      if (e.key === "organizationFullName") {
        setOrganizationFullName(e.newValue || "");
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("superAdminNameUpdated", handleNameUpdate);
      window.removeEventListener("organizationUpdated", handleOrgUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Mobile menu handler
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [mobileMenuOpen]);

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

  // Prevent back navigation
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
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Logout
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8082/dine-ease/api/v1/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Logout failed");

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Search bar handler
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        fetch(`http://localhost:8082/dine-ease/api/v1/search?query=${searchQuery}`)
          .then((res) => res.json())
          .then((data) => setSearchResults(data))
          .catch(() => setSearchResults([]));
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [searchQuery]);

  return (
    <div className={`SuperAdmin-Dashboard-dashboard ${sidebarOpen ? "SuperAdmin-Dashboard-expanded" : "SuperAdmin-Dashboard-collapsed"}`}>
      <div className={`SuperAdmin-Dashboard-sidebar-overlay ${mobileMenuOpen ? "SuperAdmin-Dashboard-active" : ""}`} onClick={() => setMobileMenuOpen(false)}></div>

      {/* SIDEBAR */}
      <aside className={`SuperAdmin-Dashboard-sidebar ${sidebarOpen ? "SuperAdmin-Dashboard-sidebar-expanded" : "SuperAdmin-Dashboard-sidebar-collapsed"} ${mobileMenuOpen ? "SuperAdmin-Dashboard-mobile-open" : ""}`}>
        <div className="SuperAdmin-Dashboard-sidebar-header">
          <div
            className="SuperAdmin-Dashboard-logo-container"
            onClick={() => { navigate("/superAdminDashboard"); window.location.reload(); }}
            style={{ cursor: "pointer" }}
          >
            <div className="SuperAdmin-Dashboard-logo-icon"><SoupIcon size={58} /></div>
            {sidebarOpen && <h2 className="SuperAdmin-Dashboard-logo">DINE_EASE</h2>}
          </div>
        </div>

        {/* ALL MENU ITEMS */}
        <ul className="SuperAdmin-Dashboard-sidebar-menu">

          {/* Dashboard Dropdown */}
          <li className={`SuperAdmin-Dashboard-menu-dropdown ${dashboardDropdownOpen ? "SuperAdmin-Dashboard-active" : ""}`}>
            <div className="SuperAdmin-Dashboard-menu-link" onClick={() => setDashboardDropdownOpen((prev) => !prev)}>
              <FaHome />
              {sidebarOpen && (
                <>
                  <span>Super Admin Console</span>
                  <FaChevronRight className={`SuperAdmin-Dashboard-dropdown-icon ${dashboardDropdownOpen ? "SuperAdmin-Dashboard-rotated" : ""}`} />
                </>
              )}
            </div>

            {dashboardDropdownOpen && sidebarOpen && (
              <ul className="SuperAdmin-Dashboard-submenu">
                {dashboardOptions.map((option) => (
                  <li key={option.path}>
                    <NavLink
                      to={option.path}
                      onClick={() => window.innerWidth <= 768 && setMobileMenuOpen(false)}
                    >
                      {option.icon} <span>{option.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* STAFF Dropdown */}
          <li className={`SuperAdmin-Dashboard-menu-dropdown ${staffDropdownOpen ? "SuperAdmin-Dashboard-active" : ""}`}>
            <div className="SuperAdmin-Dashboard-menu-link" onClick={() => setStaffDropdownOpen((prev) => !prev)}>
              <FaUsers />
              {sidebarOpen && (
                <>
                  <span>Staff Management</span>
                  <FaChevronRight className={`SuperAdmin-Dashboard-dropdown-icon ${staffDropdownOpen ? "SuperAdmin-Dashboard-rotated" : ""}`} />
                </>
              )}
            </div>

            {staffDropdownOpen && sidebarOpen && (
              <ul className="SuperAdmin-Dashboard-submenu">
                <li>
                  <NavLink to="/superAdminDashboard/staff" onClick={() => window.innerWidth <= 768 && setMobileMenuOpen(false)}>
                    <FaUsers /> <span>Staff</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/superAdminDashboard/staffrole" onClick={() => window.innerWidth <= 768 && setMobileMenuOpen(false)}>
                    <FaIdBadge /> <span>Staff Role</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* MENU Dropdown */}
          <li className={`SuperAdmin-Dashboard-menu-dropdown ${menuDropdownOpen ? "SuperAdmin-Dashboard-active" : ""}`}>
            <div className="SuperAdmin-Dashboard-menu-link" onClick={() => setMenuDropdownOpen((prev) => !prev)}>
              <FaUtensils />
              {sidebarOpen && (
                <>
                  <span>Menu Dashboard</span>
                  <FaChevronRight className={`SuperAdmin-Dashboard-dropdown-icon ${menuDropdownOpen ? "SuperAdmin-Dashboard-rotated" : ""}`} />
                </>
              )}
            </div>

            {menuDropdownOpen && sidebarOpen && (
              <ul className="SuperAdmin-Dashboard-submenu">
                {menuOptions.map((option) => (
                  <li key={option.path}>
                    <NavLink
                      to={option.path}
                      onClick={() => window.innerWidth <= 768 && setMobileMenuOpen(false)}
                    >
                      {option.icon} <span>{option.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* TABLE MANAGEMENT */}
          <li>
            <NavLink to="/superAdminDashboard/table">
              <FaTable />
              {sidebarOpen && <span>Table Management</span>}
            </NavLink>
          </li>
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="SuperAdmin-Dashboard-main-content">
        <div className="SuperAdmin-Dashboard-topbar">
          <div
            className={`SuperAdmin-Dashboard-menu-toggle ${mobileMenuOpen || !sidebarOpen ? "SuperAdmin-Dashboard-active" : ""}`}
            onClick={() => {
              if (window.innerWidth <= 768) {
                setMobileMenuOpen((prev) => !prev);
              } else {
                setSidebarOpen((prev) => {
                  const newState = !prev;
                  localStorage.setItem("sidebarOpen", JSON.stringify(newState));
                  return newState;
                });
              }
            }}
          >
            <span></span> <span></span> <span></span>
          </div>

          {/* Search */}
          <div className="SuperAdmin-Dashboard-search-bar">
            {searchResults.length > 0 && (
              <div className="SuperAdmin-Dashboard-search-results">
                {searchResults.map((item, idx) => (
                  <div key={idx} className="SuperAdmin-Dashboard-search-item">
                    {item.name || item.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CENTER TITLE */}
          <div className="SuperAdmin-Dashboard-organization-center">
            <h2 className="SuperAdmin-Dashboard-organization-title">
              {organizationName || "Organization Name"}
            </h2>
          </div>

          {/* PROFILE */}
          <div className="SuperAdmin-Dashboard-topbar-actions" ref={dropdownRef}>
            <div className="SuperAdmin-Dashboard-profile-info">
              <div
                className="SuperAdmin-Dashboard-hello-bubble"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <span>Hello, {userName}</span>
                <img
                  src="https://via.placeholder.com/40"
                  alt="profile"
                  className="SuperAdmin-Dashboard-profile-avatar-curved"
                />
              </div>

              {dropdownOpen && (
                <div className="SuperAdmin-Dashboard-profile-dropdown">
                  <button onClick={() => navigate("/superAdminDashboard/profile")}>
                    <FaIdBadge /> Profile
                  </button>
                  <button onClick={() => navigate("/superAdminDashboard/settings")}>
                    <FaCog /> Settings
                  </button>
                  <button className="SuperAdmin-Dashboard-logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Outlet context={{ hotels }} />
      </main>
    </div>
  );
};

export default SuperAdminDashboard;