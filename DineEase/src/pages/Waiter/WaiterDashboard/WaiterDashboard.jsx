import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { LayoutDashboard, Utensils, LogOut, CalendarDays } from "lucide-react";
import "./WaiterDashboard.css";

export default function WaiterDashboard() {
  const [waiterName, setWaiterName] = useState("Waiter");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Redirect if not logged in or not a WAITER
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "WAITER") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Resize sidebar
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dropdown outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load waiter name from localStorage
  useEffect(() => {
    const name = localStorage.getItem("waiterName") || "Waiter John";
    setWaiterName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("waiterName");
    localStorage.removeItem("assignedTables");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/", { replace: true });
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

          <div className="header-left">Welcome, {waiterName}</div>

          <div className="header-right" ref={dropdownRef}>
            <div
              className="profile-circle"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {waiterName.charAt(0).toUpperCase()}
            </div>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
