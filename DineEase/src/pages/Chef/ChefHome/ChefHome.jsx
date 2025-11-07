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
  Bell,
  Clock,
  AlertTriangle,
  FlameKindling,
  CheckCircle2,
  Menu,
  Home,
} from "lucide-react";
import "./ChefHome.css";


export default function ChefHome() {
  const [chefName, setChefName] = useState("shaikyakuvali123");
  const [restaurantName] = useState("DineEase Restaurant");
  // start collapsed on small screens, expanded on larger
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profilePic] = useState(null);
  // Load saved notification read states from localStorage
  const loadSavedReadStates = () => {
    const saved = localStorage.getItem("notificationReadStates");
    return saved ? JSON.parse(saved) : {};
  };

  // Initial notifications with read states from localStorage

  const [notifications, setNotifications] = useState([
    {
      id: 45,
      label: "Order #45 — 3 items",
      details: "2× Pasta Carbonara, 1× Caesar Salad",
      status: "New",
      timeAgo: "2m",
      unread: true,
      priority: "high",
      table: "Table 12",
    },
    {
      id: 46,
      label: "Order #46 — 1 item",
      details: "1× Grilled Salmon",
      status: "Preparing",
      timeAgo: "7m",
      unread: true,
      priority: "normal",
      table: "Table 8",
    },
    {
      id: 47,
      label: "Order #47 — 2 items",
      details: "1× Mushroom Risotto, 1× Tiramisu",
      status: "Ready",
      timeAgo: "12m",
      unread: false,
      priority: "normal",
      table: "Table 15",
    },
  ].map(notif => ({
    ...notif,
    unread: loadSavedReadStates()[notif.id] ?? notif.unread
  })));
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load name
  useEffect(() => {
    const name = localStorage.getItem("chefName");
    if (name) setChefName(name);
  }, []);

  // Dropdown close outside click
  // Save notification read states to localStorage whenever they change
  useEffect(() => {
    const readStates = notifications.reduce((acc, n) => ({
      ...acc,
      [n.id]: n.unread
    }), {});
    localStorage.setItem("notificationReadStates", JSON.stringify(readStates));
  }, [notifications]);

  // Mock WebSocket for new orders demo
  useEffect(() => {
    const mockOrders = [
      {
        id: 48,
        label: "Order #48 — 4 items",
        details: "2× Steak (Medium), 2× Chocolate Cake",
        status: "New",
        priority: "high",
        table: "Table 3",
      },
      {
        id: 49,
        label: "Order #49 — 2 items",
        details: "1× Seafood Pasta, 1× Crème Brûlée",
        status: "New",
        priority: "normal",
        table: "Table 7",
      }
    ];

    let orderIndex = 0;
    const interval = setInterval(() => {
      if (orderIndex < mockOrders.length) {
        const newOrder = {
          ...mockOrders[orderIndex],
          timeAgo: "just now",
          unread: true
        };
        setNotifications(prev => [newOrder, ...prev]);
        orderIndex++;
      }
    }, 15000); // New order every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  

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

          
        </nav>
      </aside>

      {/* overlay/backdrop for mobile sidebar */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

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
            {/* Notification bell (click to open list / navigate to OrdersQueue) */}
            <div className="notification-wrapper">
              <button
                className="notif-btn"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                }}
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="notif-badge">{notifications.length}</span>
                )}
              </button>

              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-actions">
                    <button
                      className="mark-all-btn"
                      onClick={() => {
                        setNotifications((prev) => prev.map((p) => ({ ...p, unread: false })));
                      }}
                    >
                      Mark all read
                    </button>
                    <button
                      className="clear-btn"
                      onClick={() => setNotifications([])}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 && (
                      <div className="notif-empty">No notifications</div>
                    )}
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`notif-item ${n.unread ? "unread" : ""}`}
                      >
                        <div
                          className="notif-main"
                            onClick={() => {
                            // navigate to OrdersQueue when clicking a notification (use absolute path)
                            setNotifications((prev) => prev.map((p) => (p.id === n.id ? { ...p, unread: false } : p)));
                            navigate("/chefDashboard/OrdersQueue");
                            setNotifOpen(false);
                          }}
                        >
                          <div className="notif-header">
                            <div className="notif-title">
                              {n.label}
                              {n.priority === "high" && (
                                <AlertTriangle size={14} className="priority-icon" />
                              )}
                            </div>
                            <div className="notif-table">{n.table}</div>
                          </div>
                          <div className="notif-details">{n.details}</div>
                          <div className="notif-meta">
                            <span className={`notif-status ${n.status.toLowerCase()}`}>
                              {n.status === "New" && <AlertTriangle size={14} />}
                              {n.status === "Preparing" && <FlameKindling size={14} />}
                              {n.status === "Ready" && <CheckCircle2 size={14} />}
                              {n.status}
                            </span>
                            <span className="notif-time">
                              <Clock size={14} />
                              {n.timeAgo} ago
                            </span>
                          </div>
                        </div>
                        <div className="notif-controls">
                          {n.unread && <span className="unread-dot" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="notif-footer">
                    <button
                      className="view-all-btn"
                      onClick={() => navigate("/chefDashboard/OrdersQueue")}
                    >
                      View all orders
                    </button>
                  </div>
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
                <button onClick={() => navigate("/chefDashboard/profile")}> 
                  <User size={16} /> Profile
                </button>
                <button onClick={() => navigate("/chefDashboard/settings")}>
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
        <section className="page-container container">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
