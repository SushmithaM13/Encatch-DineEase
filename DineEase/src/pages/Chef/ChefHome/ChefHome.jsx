// pages/ChefHome.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Boxes,
  LogOut,
  Settings,
  User,
  Search,
  Menu,
  Home,
} from "lucide-react";
import "./ChefHome.css";

export default function ChefHome() {
  const [chefName, setChefName] = useState("shaikyakuvali123");
  const [restaurantName, setRestaurantName] = useState("DineEase Restaurant");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load name
  useEffect(() => {
    const name = localStorage.getItem("chefName");
    if (name) setChefName(name);
  }, []);

  // Dropdown close outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search simulation
  useEffect(() => {
    if (!searchQuery.trim()) return setSearchResults([]);
    const dummyResults = [
      { type: "Order", label: "Order #45 - 3 items" },
      { type: "Menu", label: "Pasta Alfredo" },
      { type: "Inventory", label: "Tomatoes (Low Stock)" },
    ];
    setSearchResults(
      dummyResults.filter((r) =>
        r.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className={`chef-layout ${sidebarOpen ? "sidebar-open" : "collapsed"}`}>
      {/* ===== Sidebar ===== */}
      <aside className="chef-sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <UtensilsCrossed size={22} />
            {sidebarOpen && <span className="brand-name">DineEase</span>}
          </div>
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="nav-links">
          {/* Home */}
          <NavLink
            to=""
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Home size={20} />
            {sidebarOpen && <span>Home</span>}
          </NavLink>

          {/* Dashboard */}
          <NavLink
            to="ChefDashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <LayoutDashboard size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </NavLink>

          {/* Orders */}
          <NavLink
            to="OrdersQueue"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <ClipboardList size={20} />
            {sidebarOpen && <span>Order Queue</span>}
          </NavLink>

          {/* Menu */}
          <NavLink
            to="menu"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <UtensilsCrossed size={20} />
            {sidebarOpen && <span>Menu Catalog</span>}
          </NavLink>

          {/* Inventory */}
          <NavLink
            to="inventory"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Boxes size={20} />
            {sidebarOpen && <span>Inventory</span>}
          </NavLink>

          <div className="nav-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* ===== Main Area ===== */}
      <main className="chef-main">
        {/* Header */}
        <header className="chef-header">
          <div className="header-left">
            <h1 className="page-title">Welcome, {chefName}</h1>
          </div>

          <div className="header-center">
            <div className="restaurant-badge">
              <UtensilsCrossed size={18} />
              <span>{restaurantName}</span>
            </div>
          </div>

          <div className="header-right" ref={dropdownRef}>
            {/* Search */}
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search orders, menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((res, i) => (
                    <div key={i} className="search-item">
                      <strong>{res.type}:</strong> {res.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div
              className="profile-circle"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" />
              ) : (
                chefName.charAt(0).toUpperCase()
              )}
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={() => navigate("profile")}>
                  <User size={16} /> Profile
                </button>
                <button onClick={() => navigate("settings")}>
                  <Settings size={16} /> Settings
                </button>
                <button onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Outlet */}
        <section className="page-container">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
