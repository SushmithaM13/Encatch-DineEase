import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import SoupIcon from "./SoupIcon";
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
  FaBell,
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
  const [userName, setUserName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationFullName, setOrganizationFullName] = useState("");

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const dashboardOptions = [
    { path: "/superAdminDashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/superAdminDashboard/Analytics", label: "Analytics", icon: <FaChartBar /> },
    { path: "/superAdminDashboard/reports", label: "Reports", icon: <FaFileAlt /> },
    { path: "/superAdminDashboard/settings", label: "Settings", icon: <FaCog /> },
  ];

  const menuOptions = [
    { path: "/superAdminDashboard/Menu/category", label: "Add Category", icon: <FaFolder /> },
    { path: "/superAdminDashboard/Menu/item", label: "Add Item", icon: <FaPlusCircle /> },
    { path: "/superAdminDashboard/Menu/food", label: "Food Type", icon: <FaUtensils /> },
    { path: "/superAdminDashboard/Menu/cuisine", label: "Cuisine Type", icon: <FaBars /> },
    { path: "/superAdminDashboard/Menu/variant", label: "Add Variant", icon: <FaTags /> },
    { path: "/superAdminDashboard/Menu/addon", label: "Add Addon", icon: <FaPuzzlePiece /> },
    { path: "/superAdminDashboard/Menu/customization", label: "Customization Group", icon: <FaMagic /> },
  ];

  // ✅ Load user and organization data
  useEffect(() => {
    // const storedHotels = JSON.parse(localStorage.getItem("hotels") || "[]");
    // setHotels(storedHotels);

try {
    const storedHotels = JSON.parse(localStorage.getItem("hotels") || "[]");
    setHotels(storedHotels);
  } catch (e) {
    console.error("Invalid hotels data in localStorage:", e);
    setHotels([]);
  }


    // const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    // if (storedUser?.name) setUserName(storedUser.name);
    // else setUserName("User");


     try {
    const storedUserRaw = localStorage.getItem("user");
    const storedUser = storedUserRaw && storedUserRaw !== "undefined"
      ? JSON.parse(storedUserRaw)
      : {};

    setUserName(storedUser?.name || "User");
  } catch (e) {
    console.error("Invalid user data in localStorage:", e);
    setUserName("User");
  }


  //    
  
   try {
    const storedOrgRaw = localStorage.getItem("organization");
    const storedOrg =
      storedOrgRaw && storedOrgRaw !== "undefined"
        ? JSON.parse(storedOrgRaw)
        : null;

    if (storedOrg) {
      setOrganizationName(storedOrg.name || "");
      setOrganizationFullName(storedOrg.fullName || "");
    }
  } catch (e) {
    console.error("Invalid organization data in localStorage:", e);
    setOrganizationName("");
    setOrganizationFullName("");
    localStorage.removeItem("organization"); // remove bad data
  }

  const orgName = localStorage.getItem("organizationName");
  const fullName = localStorage.getItem("organizationFullName");

  if (orgName) setOrganizationName(orgName);
  if (fullName) setOrganizationFullName(fullName);

  const handleStorageChange = (e) => {
    if (e.key === "organizationName") setOrganizationName(e.newValue || "");
    if (e.key === "organizationFullName") setOrganizationFullName(e.newValue || "");
  };

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [mobileMenuOpen]);

  const handleMobileMenuClose = () => setMobileMenuOpen(false);

  // ✅ Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Prevent back navigation for logged-in SuperAdmin
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

  // ✅ Logout
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

  // ✅ Search functionality
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

  return (
    <div className={`dashboard ${sidebarOpen ? "expanded" : "collapsed"}`}>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={handleMobileMenuClose}
      ></div>

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"} ${mobileMenuOpen ? "mobile-open" : ""
          }`}
      >
        <div className="sidebar-header">
          <div
            className="logo-container"
            onClick={() => {
              navigate("/superAdminDashboard");
              window.location.reload();
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="logo-icon">
              <SoupIcon size={58} />
            </div>
            {sidebarOpen && <h2 className="logo">DINE_EASE</h2>}
          </div>
        </div>

        <ul className="sidebar-menu">
          {/* Dashboard Dropdown */}
          <li className={`menu-dropdown ${dashboardDropdownOpen ? "active" : ""}`}>
            <div className="menu-link" onClick={() => setDashboardDropdownOpen((prev) => !prev)}>
              <FaHome />
              {sidebarOpen && (
                <>
                  <span>Super Admin Console</span>
                  <FaChevronRight
                    className={`dropdown-icon ${dashboardDropdownOpen ? "rotated" : ""}`}
                  />
                </>
              )}
            </div>
            {dashboardDropdownOpen && sidebarOpen && (
              <ul className="submenu">
                {dashboardOptions.map((option) => (
                  <li key={option.path}>
                    <NavLink
                      to={option.path}
                      onClick={() => {
                        setDashboardDropdownOpen(false);
                        if (window.innerWidth <= 768) handleMobileMenuClose();
                      }}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Other Sidebar Links */}
          <li>
            <NavLink to="/superAdminDashboard/staff">
              <FaUsers />
              {sidebarOpen && <span>STAFF</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/superAdminDashboard/staffrole">
              <FaUsers />
              {sidebarOpen && <span>STAFF ROLE</span>}
            </NavLink>
          </li>

          {/* Menu Dashboard Dropdown */}
          <li className={`menu-dropdown ${menuDropdownOpen ? "active" : ""}`}>
            <div className="menu-link" onClick={() => setMenuDropdownOpen((prev) => !prev)}>
              <FaUtensils />
              {sidebarOpen && (
                <>
                  <span>Menu Dashboard</span>
                  <FaChevronRight
                    className={`dropdown-icon ${menuDropdownOpen ? "rotated" : ""}`}
                  />
                </>
              )}
            </div>
            {menuDropdownOpen && sidebarOpen && (
              <ul className="submenu">
                {menuOptions.map((option) => (
                  <li key={option.path}>
                    <NavLink
                      to={option.path}
                      onClick={() => {
                        setMenuDropdownOpen(false);
                        if (window.innerWidth <= 768) handleMobileMenuClose();
                      }}
                    >
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
        {/* Topbar */}
        <div className="topbar">
          {/* ☰ Menu toggle */}
          <div
            className={`menu-toggle ${mobileMenuOpen || !sidebarOpen ? "active" : ""}`}
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
            <span></span>
            <span></span>
            <span></span>
          </div>

          {/* 🔍 Search bar (left) */}
          <div className="search-bar">
            <FaSearch className="Search-icon" />
            <input
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((item, idx) => (
                  <div key={idx} className="search-item">
                    {item.name || item.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 🏢 Organization Name (center) */}
          <div className="organization-center">
            <h2 className="organization-title">
              {organizationName || "Organization Name"}</h2>
          </div>

          {/* 🔔 Notification + Profile (right) */}
          <div className="topbar-actions" ref={dropdownRef}>
            <button className="icon-btn notification-btn">
            </button>

            <div className="profile-info">
              <div className="hello-bubble" onClick={() => setDropdownOpen((prev) => !prev)}>
                <span>Hello, {organizationFullName || userName}</span>
                <img
                  src="https://via.placeholder.com/40"
                  alt="profile"
                  className="profile-avatar-curved"
                />
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
        </div>

        <Outlet context={{ hotels }} />
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
