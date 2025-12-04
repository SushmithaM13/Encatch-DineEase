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
  FaChevronRight,
  FaChartBar,
  FaFileAlt,
} from "react-icons/fa";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved ? JSON.parse(saved) : true;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);
  const [hotels, setHotels] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hotels") || "[]");
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // --- Dynamically read user and org info from localStorage ---
  const getUserName = () => {
    const userRaw = localStorage.getItem("user");
    const user = userRaw && userRaw !== "undefined" ? JSON.parse(userRaw) : {};
    const superAdminFullName = localStorage.getItem("superAdminFullName");
    return superAdminFullName || user?.name || "User";
  };

  const getOrganizationName = () => {
    const orgRaw = localStorage.getItem("organization");
    const org = orgRaw && orgRaw !== "undefined" ? JSON.parse(orgRaw) : null;
    const orgName = localStorage.getItem("organizationName");
    return org?.name || orgName || "Organization Name";
  };

  // State only for typing animation display
  const [displayedName, setDisplayedName] = useState(getUserName());

  // Typing animation whenever the username changes
  useEffect(() => {
    const fullName = getUserName();
    let index = 0;
    setDisplayedName(""); // reset animation
    const typingInterval = setInterval(() => {
      setDisplayedName(fullName.slice(0, index + 1));
      index++;
      if (index > fullName.length) clearInterval(typingInterval);
    }, 50);
    return () => clearInterval(typingInterval);
  }, [getUserName()]);

  // Update displayedName immediately whenever localStorage changes (login/profile switch)
  useEffect(() => {
    const handleStorageChange = () => {
      const fullName = getUserName();
      setDisplayedName(fullName); // immediately update username
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMobileMenuClose = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch("http://localhost:8082/dine-ease/api/v1/users/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Logout failed");
      localStorage.clear(); // clear all user/org data
      setDisplayedName("User"); // reset username immediately
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        fetch(`http://localhost:8082/dine-ease/api/v1/search?query=${searchQuery}`)
          .then((res) => res.json())
          .then((data) => setSearchResults(data))
          .catch((err) => console.error("Search error:", err));
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const dashboardOptions = [
    { path: "/superAdminDashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/superAdminDashboard/Analytics", label: "Analytics", icon: <FaChartBar /> },
    { path: "/superAdminDashboard/reports", label: "Reports", icon: <FaFileAlt /> },
    { path: "/superAdminDashboard/settings", label: "Settings", icon: <FaCog /> },
  ];

  const menuOptions = [
    { path: "/superAdminDashboard/category-form", label: "Add Category", icon: <FaFolder /> },
    { path: "/superAdminDashboard/add-item-type", label: "Add Item", icon: <FaPlusCircle /> },
    { path: "/superAdminDashboard/food-type", label: "Food Type", icon: <FaUtensils /> },
    { path: "/superAdminDashboard/cuisine-type", label: "Cuisine Type", icon: <FaBars /> },
    { path: "/superAdminDashboard/variant-form", label: "Add Variant", icon: <FaTags /> },
    { path: "/superAdminDashboard/addon-form", label: "Add Addon", icon: <FaPuzzlePiece /> },
    { path: "/superAdminDashboard/customization-group-form", label: "Customization Group", icon: <FaMagic /> },
  ];

  return (
    <div className={`dashboard ${sidebarOpen ? "expanded" : "collapsed"}`}>
      <div className={`sidebar-overlay ${mobileMenuOpen ? "active" : ""}`} onClick={handleMobileMenuClose}></div>

      <aside className={`sidebar ${sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"} ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container" onClick={() => navigate("/superAdminDashboard")} style={{ cursor: "pointer" }}>
            <div className="logo-icon"><SoupIcon size={58} /></div>
            {sidebarOpen && <h2 className="logo">DINE_EASE</h2>}
          </div>
        </div>

        <ul className="sidebar-menu">
          {/* Dashboard */}
          <li className={`menu-dropdown ${dashboardDropdownOpen ? "active" : ""}`}>
            <div className="menu-link" onClick={() => setDashboardDropdownOpen(prev => !prev)}>
              <FaHome />
              {sidebarOpen && <>
                <span>Super Admin Console</span>
                <FaChevronRight className={`dropdown-icon ${dashboardDropdownOpen ? "rotated" : ""}`} />
              </>}
            </div>
            {dashboardDropdownOpen && sidebarOpen && (
              <ul className="submenu">
                {dashboardOptions.map((option) => (
                  <li key={option.path}>
                    <NavLink to={option.path} onClick={() => window.innerWidth <= 768 && handleMobileMenuClose()}>
                      {option.icon}<span>{option.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Staff */}
          <li className={`menu-dropdown ${staffDropdownOpen ? "active" : ""}`}>
            <div className="menu-link" onClick={() => setStaffDropdownOpen(prev => !prev)}>
              <FaUsers />
              {sidebarOpen && <>
                <span>Staff Management</span>
                <FaChevronRight className={`dropdown-icon ${staffDropdownOpen ? "rotated" : ""}`} />
              </>}
            </div>
            {staffDropdownOpen && sidebarOpen && (
              <ul className="submenu">
                <li>
                  <NavLink to="/superAdminDashboard/staff" onClick={() => window.innerWidth <= 768 && handleMobileMenuClose()}>
                    <FaUsers /><span>Staff</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/superAdminDashboard/staffrole" onClick={() => window.innerWidth <= 768 && handleMobileMenuClose()}>
                    <FaIdBadge /><span>Staff Role</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>

          {/* Menu */}
          <li className={`menu-dropdown ${menuDropdownOpen ? "active" : ""}`}>
            <div className="menu-link" onClick={() => setMenuDropdownOpen(prev => !prev)}>
              <FaUtensils />
              {sidebarOpen && <>
                <span>Menu Dashboard</span>
                <FaChevronRight className={`dropdown-icon ${menuDropdownOpen ? "rotated" : ""}`} />
              </>}
            </div>
            {menuDropdownOpen && sidebarOpen && (
              <ul className="submenu">
                {menuOptions.map((option) => (
                  <li key={option.path}>
                    <NavLink to={option.path} onClick={() => window.innerWidth <= 768 && handleMobileMenuClose()}>
                      {option.icon}<span>{option.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li>
            <NavLink to="/superAdminDashboard/table">
              <FaTable />{sidebarOpen && <span>Table Management</span>}
            </NavLink>
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className={`menu-toggle ${mobileMenuOpen || !sidebarOpen ? "active" : ""}`}
            onClick={() => {
              if (window.innerWidth <= 768) setMobileMenuOpen(prev => !prev);
              else setSidebarOpen(prev => { const newState = !prev; localStorage.setItem("sidebarOpen", JSON.stringify(newState)); return newState; });
            }}>
            <span></span><span></span><span></span>
          </div>

          <div className="search-bar"></div>

          <div className="organization-center">
            <h2 className="organization-title">{getOrganizationName()}</h2>
          </div>

          <div className="topbar-actions" ref={dropdownRef}>
            <div className="profile-info" onClick={() => setDropdownOpen(prev => !prev)}>
              <span className="profile-name">{displayedName}</span>
              <img src="https://i.pravatar.cc/150?img=3" alt="profile" className="profile-avatar" />
            </div>

            {dropdownOpen && (
              <div className="profile-dropdown">
                <button className="dropdown-btn" onClick={() => navigate("/superAdminDashboard/profile")}><FaIdBadge /> Profile</button>
                <button className="dropdown-btn" onClick={() => navigate("/superAdminDashboard/settings")}><FaCog /> Settings</button>
                <button className="dropdown-btn logout-btn" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
              </div>
            )}
          </div>
        </div>

        <Outlet context={{ hotels }} />
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
