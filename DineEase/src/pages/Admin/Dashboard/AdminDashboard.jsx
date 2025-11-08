import { useEffect, useState, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const TOKEN = localStorage.getItem("token");
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";

  const isActive = (path) => location.pathname === path;

  // ===== Fetch Admin Profile =====
  useEffect(() => {
    const fetchProfile = async () => {
      if (!TOKEN) {
        toast.error("Token missing! Please login.", { position: "top-center" });
        return;
      }

      try {
        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setAdminName(data.firstName || "Admin");
        setRestaurantName(data.organizationName || "My Restaurant");

        if (data.profileImage) {
          setProfilePic(`data:image/jpeg;base64,${data.profileImage}`);
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
        toast.error("Failed to fetch organization details", {
          position: "top-center",
        });
      }
    };

    fetchProfile();
  }, [TOKEN]);

  // ===== Handle Responsive Sidebar =====
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===== Close Dropdown on Outside Click =====
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

  // ===== Logout =====
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
        className={`admin-sidebar ${
          sidebarOpen ? "admin-open" : "admin-collapsed"
        }`}
      >
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-title">
            <Utensils size={22} />
            {sidebarOpen && <span style={{ marginLeft: 8 }}>Dineease</span>}
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <Link
            to="/AdminDashboard/dashboard"
            className={`admin-sidebar-link ${
              isActive("/AdminDashboard/dashboard") ? "active" : ""
            }`}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <LayoutDashboard size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          {/* === Staff Management === */}
          <div
            className={`admin-sidebar-link ${
              showStaffDropdown ? "active" : ""
            }`}
            onClick={() => setShowStaffDropdown((prev) => !prev)}
          >
            <Users size={18} />
            {sidebarOpen && (
              <>
                <span>Staff</span>
                {showStaffDropdown ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </>
            )}
          </div>

          {showStaffDropdown && (
            <div className="admin-submenu">
              <Link to="/AdminDashboard/roles" className="admin-submenu-link">
                Manage Roles
              </Link>
              <Link to="/AdminDashboard/staff" className="admin-submenu-link">
                Manage Staff
              </Link>
            </div>
          )}

          {/* === Menu Management === */}
          <div
            className={`admin-sidebar-link ${menuExpanded ? "active" : ""}`}
            onClick={() => setMenuExpanded((prev) => !prev)}
          >
            <Newspaper size={18} />
            {sidebarOpen && (
              <>
                <span>Menu</span>
                {menuExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </>
            )}
          </div>

          {menuExpanded && (
            <div className="admin-submenu">
              <Link to="/AdminDashboard/menu" className="admin-submenu-link">
                Manage Menus
              </Link>
              <Link
                to="/AdminDashboard/menu-category"
                className="admin-submenu-link"
              >
                Menu Category
              </Link>
              <Link
                to="/AdminDashboard/customization-groups"
                className="admin-submenu-link"
              >
                Customization Groups
              </Link>
              <Link
                to="/AdminDashboard/item-type"
                className="admin-submenu-link"
              >
                Item Type
              </Link>
              <Link
                to="/AdminDashboard/food-type"
                className="admin-submenu-link"
              >
                Food Type
              </Link>
              <Link
                to="/AdminDashboard/cuisine-type"
                className="admin-submenu-link"
              >
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
            className={`admin-sidebar-link ${
              isActive("/AdminDashboard/table") ? "active" : ""
            }`}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <Sofa size={20} />
            {sidebarOpen && <span>Table</span>}
          </Link>

          <Link
            to="/AdminDashboard/revenue"
            className={`admin-sidebar-link ${
              isActive("/AdminDashboard/revenue") ? "active" : ""
            }`}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <IndianRupee size={20} />
            {sidebarOpen && <span>Revenue</span>}
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
          </div>

          <div className="admin-header-center">
            <div className="admin-restaurant-display">
              <Utensils size={20} color="blue" />
              <span>{restaurantName || "Restaurant"}</span>
            </div>
          </div>

          <div className="admin-header-right" ref={dropdownRef}>
            <div
              className="admin-profile-circle"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="admin-profile-pic"
                />
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
