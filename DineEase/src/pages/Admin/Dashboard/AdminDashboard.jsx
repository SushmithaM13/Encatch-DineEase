import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard,
  Utensils,
  User,
  Newspaper,
  LogOut,
  Sofa,   
  Users,
  Settings,
  IndianRupee,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState("Admin");
  const [restaurantName, setRestaurantName] = useState("Restaurant");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close profile dropdown on outside click
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

  // Dummy search results for UI demo
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const dummyResults = [
      { type: "Staff", label: "John Doe (Chef)" },
      { type: "Menu", label: "Pasta - ₹250" },
      { type: "Table", label: "Table 5 (Available)" },
    ];
    setSearchResults(
      dummyResults.filter((res) =>
        res.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  // Logout function
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(
        "http://localhost:8082/dine-ease/api/v1/users/logout",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Clear user info
        setAdminName("Admin");
        setRestaurantName("Restaurant");
        setProfilePic(null);
        sessionStorage.clear();
        localStorage.removeItem("token");

        toast.success("✅ Successfully logged out!");

        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error("⚠️ Logout failed: " + (data.message || "Try again"));
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("❌ Error during logout. Please try again later.");
    }
  };

  return (
    <div className="admin-layout-container">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "admin-open" : "admin-collapsed"}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-title">
            <Utensils size={22} />
            {sidebarOpen && <span style={{ marginLeft: 8 }}>Dineease</span>}
          </div>
          {!isMobile && (
            <button
              className="admin-hamburger admin-desktop-only"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          )}
        </div>

        <nav className="admin-sidebar-nav">
          {[
            { to: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
            { to: "roles", icon: <User size={22} />, label: "Role Management" },
            { to: "staff", icon: <Users size={22} />, label: "Staff Management" },
            { to: "menu", icon: <Newspaper size={22} />, label: "Menu Management" },
            { to: "table", icon: <Sofa size={22} />, label: "Table Management" },
            { to: "revenue", icon: <IndianRupee size={22} />, label: "Revenue Management" },
            { to: "settings", icon: <Settings size={22} />, label: "Settings" },
          ].map((item, i) => (
            <Link
              key={i}
              to={`/AdminDashboard/${item.to}`}
              className="admin-sidebar-link"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="admin-main-content">
        <header className="admin-dashboard-header">
          {isMobile && (
            <button
              className="admin-hamburger admin-mobile-only"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          )}

          <div className="admin-header-left">Welcome, {adminName}</div>

          <div className="admin-header-center">
            <div className="admin-restaurant-display">
              <Utensils size={18} color="black" />
              <span>{restaurantName}</span>
            </div>
          </div>

          <div className="admin-header-right" ref={dropdownRef}>
            {/* Search */}
            <div className="admin-search-container">
              <input
                type="text"
                placeholder="🔍 Search..."
                className="admin-search-bar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="admin-search-results">
                  {searchResults.map((res, i) => (
                    <div key={i} className="admin-search-item">
                      <strong>{res.type}:</strong> {res.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="admin-profile-dropdown">
              <div
                className="admin-profile-circle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="admin-profile-pic" />
                ) : (
                  adminName.charAt(0).toUpperCase()
                )}
              </div>
              {dropdownOpen && (
                <div className="admin-dropdown-menu">
                  <button
                    className="admin-dropdown-item"
                    onClick={() => navigate("/AdminDashboard/profile")}
                  >
                    <User size={16} /> Profile
                  </button>
                  <button
                    className="admin-dropdown-item"
                    onClick={() => navigate("/AdminDashboard/settings")}
                  >
                    <Settings size={16} /> Settings
                  </button>
                  <button
                    className="admin-dropdown-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="admin-dashboard-content">
          <Outlet />
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
