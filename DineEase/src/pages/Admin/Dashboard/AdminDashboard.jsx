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
  Menu,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { FaBars } from "react-icons/fa";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState("Admin");
  const [_restaurantName, setRestaurantName] = useState("Restaurant");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePic, _setProfilePic] = useState(null);
  const [searchQuery, _setSearchQuery] = useState("");
  const [_searchResults, setSearchResults] = useState([]);
  const [toast, setToast] = useState(null);
  const [_stats, setStats] = useState({});
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const API_BASE = "http://localhost:8082/dine-ease/api/v1";

  // ===============================
  // Toast Notification
  // ===============================
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ===============================
  // Responsive Sidebar Handling
  // ===============================
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===============================
  // Dropdown Close on Outside Click
  // ===============================
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

  // ===============================
  // Dummy Search Results
  // ===============================
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

  // ===============================
  // Fetch Staff Stats
  // ===============================
  const fetchStaffStats = async (orgId, token) => {
    try {
      const response = await fetch(
        `${API_BASE}/staff/all?organizationId=${orgId}&pageNumber=0&pageSize=10&sortBy=asc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      const staffData = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
        ? data.content
        : [];

      const total = staffData.length;
      const active = staffData.filter(
        (s) => s.staffStatus?.toLowerCase() === "active"
      ).length;
      const inactive = staffData.filter(
        (s) => s.staffStatus?.toLowerCase() === "inactive"
      ).length;
      const pending = staffData.filter(
        (s) => s.staffStatus?.toLowerCase() === "pending"
      ).length;

      setStats({
        totalStaff: total,
        activeStaff: active,
        inactiveStaff: inactive,
        pendingStaff: pending,
      });

      console.log("✅ Staff stats updated:", { total, active, inactive, pending });
    } catch (error) {
      console.error("Error fetching staff stats:", error);
    }
  };

  // ===============================
  // Fetch Organization + Staff
  // ===============================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const orgId = localStorage.getItem("organizationId");
    const admin = localStorage.getItem("username");
    const restName = localStorage.getItem("restaurantName");

    if (admin) setAdminName(admin);
    if (restName) setRestaurantName(restName);

    if (token && orgId) {
      fetchStaffStats(orgId, token);
    }
  }, []);

  // ===============================
  // Real-time Staff Update
  // ===============================
  useEffect(() => {
    const handleStaffUpdate = () => {
      const orgId = localStorage.getItem("organizationId");
      const token = localStorage.getItem("token");
      if (orgId && token) {
        fetchStaffStats(orgId, token);
        showToast("👥 Staff list updated", "info");
      }
    };

    window.addEventListener("staffUpdated", handleStaffUpdate);
    return () => window.removeEventListener("staffUpdated", handleStaffUpdate);
  }, []);

  // ===============================
  // Logout Handler
  // ===============================
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(`${API_BASE}/users/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        sessionStorage.clear();
        localStorage.removeItem("token");
        showToast("✅ Successfully logged out!");
        setTimeout(() => navigate("/"), 1500);
      } else {
        const data = await response.json().catch(() => ({}));
        showToast("⚠️ Logout failed: " + (data.message || "Try again"), "error");
      }
    } catch (error) {
      console.error("Logout error:", error);
      showToast("❌ Error during logout. Please try again later.", "error");
    }
  };

  // ===============================
  // Sidebar Toggle Functions
  // ===============================
  const handleMobileMenuToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleDesktopSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  // ===============================
  // JSX Layout
  // ===============================
  return (
    <div className="admin-layout-container">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "admin-open" : "admin-collapsed"
        }`}
      >
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <Utensils size={28} className="admin-logo-icon" />
            {sidebarOpen && <span className="admin-logo-text">DINE_EASE</span>}
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {[
            { to: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
            { to: "roles", icon: <User size={20} />, label: "Staff-role" },
            { to: "staff", icon: <Users size={20} />, label: "Staff" },
            { to: "menu", icon: <Newspaper size={20} />, label: "Food Items" },
            { to: "table", icon: <Sofa size={20} />, label: "Table Management" },
            { to: "revenue", icon: <IndianRupee size={20} />, label: "Revenue" },
            { to: "settings", icon: <Settings size={20} />, label: "Settings" },
          ].map((item, i) => (
            <Link
              key={i}
              to={`/AdminDashboard/${item.to}`}
              className="admin-sidebar-link"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <span className="admin-nav-label">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main-content">
        <header className="admin-dashboard-header">
          <div className="admin-header-left">
            <button
              className="admin-dashboard-header-menu-btn"
              onClick={() => {
                if (window.innerWidth <= 768) {
                  handleMobileMenuToggle();
                } else {
                  handleDesktopSidebarToggle();
                }
              }}
            >
              <FaBars size={22} />
            </button>
            <h1 className="admin-header-title">Admin Dashboard</h1>
          </div>

          <div className="admin-header-right" ref={dropdownRef}>
            {/* Profile Dropdown */}
            <div className="admin-profile-dropdown">
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
                  <User size={20} />
                )}
                <span className="admin-profile-name">{adminName}</span>
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
                    className="admin-dropdown-item admin-logout"
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

      {/* Toast Notification */}
      {toast && (
        <div
          className={`admin-toast ${
            toast.type === "error"
              ? "admin-toast-error"
              : toast.type === "info"
              ? "admin-toast-info"
              : "admin-toast-success"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={20} />
          ) : (
            <CheckCircle size={20} />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
