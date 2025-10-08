import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard,
  Utensils,
  ShoppingCart,
  Newspaper,
  LogOut,
  Users,
  Settings,
  CalendarDays,
  User
} from "lucide-react";
import "./WaiterDashboard.css";

export default function WaiterDashboard() {
  const [adminName, setAdminName] = useState("Waiter");
  const [restaurantName, setRestaurantName] = useState("Restaurant");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dropdown close on outside click
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

  // Search logic
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

  // Logout
  const handleLogout = () => {
    setAdminName("Admin");
    setRestaurantName("Restaurant");
    setProfilePic(null);
    navigate("/");
  };

  return (
    <div className="waiter-layout-container">
      {window.innerWidth <= 768 && sidebarOpen && (
        <div
          className="waiter-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`waiter-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="waiter-sidebar-header">
          <div className="waiter-sidebar-title">
            <Utensils size={22} />
            {sidebarOpen && <span style={{ marginLeft: "8px" }}>Dineease</span>}
          </div>
          <button
            className="waiter-hamburger desktop-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <nav className="waiter-sidebar-nav">
          <Link
            to="/WaiterDashboard"
            onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
          >
            <LayoutDashboard size={18} />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          <Link
            to="/WaiterDashboard/reservations"
            onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
          >
            <CalendarDays size={18} />
            {sidebarOpen && <span>Reservations</span>}
          </Link>

          <Link
            to="/WaiterDashboard/menu"
            onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
          >
            <Newspaper size={22} />
            {sidebarOpen && <span>Menu</span>}
          </Link>

          <Link
            to="/WaiterDashboard/orders"
            onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
          >
            <ShoppingCart size={22} />
            {sidebarOpen && <span>Orders</span>}
          </Link>

          <Link
            to="/WaiterDashboard/customers"
            onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
          >
            <Users size={22} />
            {sidebarOpen && <span>Customers</span>}
          </Link>

          <Link
            to="/WaiterDashboard/settings"
            onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
          >
            <Settings size={22} />
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="waiter-main-content">
        <header className="waiter-dashboard-header">
          <button
            className="waiter-hamburger mobile-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="waiter-header-left">Welcome, {adminName}</div>

          <div className="waiter-header-center">
            <div className="waiter-restaurant-display">
              <Utensils size={18} color="black" />
              <span>{restaurantName}</span>
            </div>
          </div>

          <div className="waiter-header-right" ref={dropdownRef}>
            {/* Search Bar */}
            <div className="waiter-search-container">
              <input
                type="text"
                placeholder="🔍 Search..."
                className="waiter-search-bar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="waiter-search-results">
                  {searchResults.map((res, i) => (
                    <div key={i} className="waiter-search-item">
                      <strong>{res.type}:</strong> {res.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="waiter-profile-dropdown">
              <div
                className="waiter-profile-circle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="waiter-circle-img" />
                ) : (
                  adminName.charAt(0).toUpperCase()
                )}
              </div>
              {dropdownOpen && (
                <div className="waiter-dropdown-menu">
                  <button onClick={() => navigate("/WaiterDashboard/profile")}>
                    <User size={16} /> Profile
                  </button>
                  <button onClick={() => navigate("/WaiterDashboard/settings")}>
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

        <main className="waiter-dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
