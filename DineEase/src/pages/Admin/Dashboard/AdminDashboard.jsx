// AdminDashboard.jsx
import { useEffect, useState, useRef } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Utensils,
  User,
  Users,
  Newspaper,
  Sofa,
  Settings,
  LogOut,
  IndianRupee,
  ChevronDown,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [adminName] = useState("");
  const [restaurantName] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const [profilePic] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown when clicking outside
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

  // Logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(
        "http://localhost:8082/dine-ease/api/v1/users/logout",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        localStorage.removeItem("token");
        sessionStorage.clear();
        toast.success("✅ Successfully logged out!");
        setTimeout(() => navigate("/"), 1000);
      } else {
        toast.error("⚠️ Logout failed. Try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("❌ Error during logout.");
    }
  };

  return (
    <div className="admin-layout-container">
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? "admin-open" : "admin-collapsed"}`}
      >
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
          <Link
            to="/AdminDashboard/dashboard"
            className="admin-sidebar-link"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <LayoutDashboard size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          {/* === Staff Management with Dropdown === */}
          <div className="admin-sidebar-dropdown">
            <button
              className="admin-sidebar-link"
              onClick={() => setShowStaffDropdown(!showStaffDropdown)}
            >
              <Users size={20} />
              {sidebarOpen && (
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  Staff
                  {showStaffDropdown ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </span>
              )}
            </button>

            {/* Staff Dropdown Items */}
            {showStaffDropdown && sidebarOpen && (
              <div className="admin-submenu">
                <Link
                  to="/AdminDashboard/roles"
                  className="admin-submenu-link"
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  Manage Roles
                </Link>
                <Link
                  to="/AdminDashboard/staff"
                  className="admin-submenu-link"
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  Manage Staff
                </Link>
              </div>
            )}
          </div>

          {/* === Menu Management === */}
          <div
            className={`admin-sidebar-link ${menuExpanded ? "active" : ""}`}
            onClick={() => setMenuExpanded((prev) => !prev)}
          >
            <Newspaper size={18} />
            {sidebarOpen && (
              <>
                <span>Menu</span>
                {menuExpanded ? <ChevronDown size={20} /> : <ChevronRight size={16} />}
              </>
            )}
          </div>

          {menuExpanded && (
            <div className="admin-submenu">
              <Link to="/AdminDashboard/menu" className="admin-submenu-link">
                Manage Menus
              </Link>
              <Link to="/AdminDashboard/menu-category" className="admin-submenu-link">
                Menu Category
              </Link>
              <Link to="/AdminDashboard/customization-groups" className="admin-submenu-link">
                Customization Groups
              </Link>
              <Link to="/AdminDashboard/item-type" className="admin-submenu-link">
                Item Type
              </Link>
              <Link to="/AdminDashboard/food-type" className="admin-submenu-link">
                Food Type
              </Link>
              <Link to="/AdminDashboard/cuisine-type" className="admin-submenu-link">
                Cuisine Type
              </Link>
              <Link to="/AdminDashboard/add-on" className="admin-submenu-link">
                Add-on
              </Link>
            </div>
          )}

          {/* === Table, Revenue, Settings === */}
          <Link
            to="/AdminDashboard/table"
            className="admin-sidebar-link"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <Sofa size={20} />
            {sidebarOpen && <span>Table</span>}
          </Link>

          <Link
            to="/AdminDashboard/revenue"
            className="admin-sidebar-link"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <IndianRupee size={20} />
            {sidebarOpen && <span>Revenue</span>}
          </Link>

          <Link
            to="/AdminDashboard/settings"
            className="admin-sidebar-link"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <Settings size={20} />
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="admin-main-content">
        <header className="admin-dashboard-header">
  <div className="admin-header-left-group">
    <button
      className="admin-hamburger-toggle"
      onClick={() => setSidebarOpen(!sidebarOpen)}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    {/* <div className="admin-header-left-text">
      Welcome, {adminName || "Admin"}
    </div> */}
  </div>

  <div className="admin-header-center">
    <div className="admin-restaurant-display">
      <Utensils size={20} color="black" />
      <span>{restaurantName || "Restaurant"}</span>
    </div>
  </div>

  {/* Profile Dropdown */}
  <div className="admin-header-right" ref={dropdownRef}>
    <div
      className="admin-profile-circle"
      onClick={() => setDropdownOpen(!dropdownOpen)}
    >
      {profilePic ? (
        <img src={profilePic} alt="Profile" className="admin-profile-pic" />
      ) : (
        (adminName || "A").charAt(0).toUpperCase()
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
        <button className="admin-dropdown-item" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    )}
  </div>
</header>


        <main className="admin-dashboard-content">
          <Outlet />
        </main>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}