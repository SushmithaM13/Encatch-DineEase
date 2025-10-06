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

  // ✅ Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
        setSidebarOpen(false);
      } else {
        setIsMobile(false);
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Close profile dropdown on outside click
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

  // ✅ Dummy search results for UI demo
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

  // ✅ Proper Logout API call (works with Spring Boot + session cookies)
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token"); // ✅ get the token
      if (!token) throw new Error("No token found");

      const response = await fetch(
        "http://localhost:8082/dine-ease/api/v1/users/logout",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`, // ✅ send token
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

        window.alert("✅ Successfully logged out!");
        navigate("/");
      } else {
        const data = await response.json().catch(() => ({}));
        window.alert("⚠️ Logout failed: " + (data.message || "Try again"));
      }
    } catch (error) {
      console.error("Logout error:", error);
      window.alert("❌ Error during logout. Please try again later.");
    }
  };


  return (
    <div className="layout-container">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <Utensils size={22} />
            {sidebarOpen && <span style={{ marginLeft: 8 }}>Dineease</span>}
          </div>
          {!isMobile && (
            <button
              className="hamburger desktop-only"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          )}
        </div>

        <nav>
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
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="main-content">
        <header className="dashboard-header">
          {isMobile && (
            <button
              className="hamburger mobile-only"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          )}

          <div className="header-left">Welcome, {adminName}</div>

          <div className="header-center">
            <div className="restaurant-display">
              <Utensils size={18} color="black" />
              <span>{restaurantName}</span>
            </div>
          </div>

          <div className="header-right" ref={dropdownRef}>
            {/* Search */}
            <div className="search-container">
              <input
                type="text"
                placeholder="🔍 Search..."
                className="search-bar"
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

            {/* Profile dropdown */}
            <div className="profile-dropdown">
              <div
                className="profile-circle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="profile-pic" />
                ) : (
                  adminName.charAt(0).toUpperCase()
                )}
              </div>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => navigate("/AdminDashboard/profile")}>
                    <User size={16} /> Profile
                  </button>
                  <button onClick={() => navigate("/AdminDashboard/settings")}>
                    <Settings size={16} /> Settings
                  </button>
                  <button onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
