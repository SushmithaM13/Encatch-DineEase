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
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  // ✅ Resize handler
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Dropdown close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Search (currently static/dummy data)
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

  // ✅ Logout clears UI state and navigates to home
  const handleLogout = () => {
    setAdminName("Admin");
    setRestaurantName("Restaurant");
    setProfilePic(null);
    navigate("/");
  };

  return (
    <div className="layout-container">
      {window.innerWidth <= 768 && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <Utensils size={22} />
            {sidebarOpen && <span style={{ marginLeft: "8px" }}>Dineease</span>}
          </div>
          <button
            className="hamburger desktop-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <nav>
  <Link
    to="/AdminDashboard/dashboard"
    onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
  >
    <LayoutDashboard size={18} />
    {sidebarOpen && <span>Dashboard</span>}
  </Link>

  <Link
  to="/AdminDashboard/roles"
  onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
>
  <User size={22} />
  {sidebarOpen && <span>Role Management</span>}
</Link>


  <Link
    to="/AdminDashboard/staff"
    onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
  >
    <Users size={22} />
    {sidebarOpen && <span>Staff Management</span>}
  </Link>

  <Link
    to="/AdminDashboard/menu"
    onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
  >
    <Newspaper size={22} />
    {sidebarOpen && <span>Menu Management</span>}
  </Link>

  <Link
    to="/AdminDashboard/table"
    onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
  >
    <Sofa size={22} />
    {sidebarOpen && <span>Table Management</span>}
  </Link>

  <Link
    to="/AdminDashboard/revenue"
    onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
  >
    <IndianRupee size={22} />
    {sidebarOpen && <span>Revenue Management</span>}
  </Link>

  <Link
    to="/AdminDashboard/settings"
    onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
  >
    <Settings size={22} />
    {sidebarOpen && <span>Settings</span>}
  </Link>
</nav>

      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="dashboard-header">
          <button
            className="hamburger mobile-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="header-left">Welcome, {adminName}</div>

          <div className="header-center">
            <div className="restaurant-display">
              <Utensils size={18} color="black" />
              <span>{restaurantName}</span>
            </div>
          </div>

          <div className="header-right" ref={dropdownRef}>
            {/* Search Bar */}
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

            {/* Profile Dropdown */}
            <div className="profile-dropdown">
              <div
                className="profile-circle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="circle-img" />
                ) : (
                  adminName.charAt(0).toUpperCase()
                )}
              </div>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => navigate("/pages/profile")}>
                    <User size={16} /> Profile
                  </button>
                  <button onClick={() => navigate("/pages/settings")}>
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
