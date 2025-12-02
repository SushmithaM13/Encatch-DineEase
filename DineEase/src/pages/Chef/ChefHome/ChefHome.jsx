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
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [chefName, setChefName] = useState(localStorage.getItem("chefName") || "Chef");
  const [restaurantName] = useState("DineEase Restaurant");

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const TOKEN = localStorage.getItem("token");

  // --------------------------
  // 1️⃣ FETCH CHEF PROFILE → GET ORG ID
  // --------------------------
  const fetchChefProfile = async () => {
    try {
      const res = await fetch(
        "http://localhost:8082/dine-ease/api/v1/staff/profile",
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const text = await res.text();
      if (!text) return;

      const data = JSON.parse(text);

      const orgId = data.organizationId || data.organization?.id || null;

      if (orgId) {
        localStorage.setItem("chefOrgId", orgId);
      }

      if (data.staffName) {
        setChefName(data.staffName);
        localStorage.setItem("chefName", data.staffName);
      }
    } catch (err) {
      console.error("❌ Error fetching chef profile:", err);
    }
  };

  // --------------------------
  // 2️⃣ FETCH NOTIFICATIONS (FIXED URL)
  // --------------------------
  const fetchNotifications = async () => {
    const orgId = localStorage.getItem("chefOrgId");

    if (!orgId) {
      console.warn("⚠ No org ID yet, waiting...");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8082/dine-ease/api/v1/chef/org/${orgId}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data = await res.json();

      setNotifications(
        data.map((n) => ({
          id: n.id,
          label: n.orderItem?.name
            ? `Order #${n.orderItem.id} — ${n.orderItem.quantity} item(s)`
            : "New Notification",
          details: n.message,
          status: n.status || "New",
          timeAgo: n.sentAt ? new Date(n.sentAt).toLocaleTimeString() : "just now",
          unread: !n.isRead,
          priority: n.priority || "normal",
          table: n.orderItem?.tableNumber || "Table X",
        }))
      );
    } catch (err) {
      console.error("❌ Notification fetch error:", err);
    }
  };

  // --------------------------
  // 3️⃣ MARK AS READ (FIXED URL)
  // --------------------------
  const markAsRead = async (id) => {
    try {
      await fetch(
        `http://localhost:8082/dine-ease/api/v1/chef/notifications/${id}/read`,
        { method: "PUT" }
      );

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // --------------------------
  // 4️⃣ DELETE NOTIFICATION (FIXED URL)
  // --------------------------
  const deleteNotification = async (id) => {
    try {
      await fetch(
        `http://localhost:8082/dine-ease/api/v1/chef/notifications/${id}`,
        { method: "DELETE" }
      );

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // --------------------------
  // USE EFFECTS
  // --------------------------
  useEffect(() => {
    if (!TOKEN) return;
    fetchChefProfile();
  }, [TOKEN]);

  useEffect(() => {
    const delayFetch = setTimeout(fetchNotifications, 500);
    return () => clearTimeout(delayFetch);
  }, [chefName]);

  // --------------------------
  // DROPDOWN/CLICK HANDLING
  // --------------------------
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --------------------------
  // UI RETURN
  // --------------------------
  return (
    <div className={`chef-layout ${sidebarOpen ? "chef-sidebar-open" : "chef-collapsed"}`}>
      
      {/* Sidebar */}
      <aside className="chef-sidebar">
        <div className="chef-sidebar-header">
          <div className="chef-brand">
            <UtensilsCrossed size={22} />
            {sidebarOpen && <span className="chef-brand-name">DineEase</span>}
          </div>
          <button className="chef-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </button>
        </div>

        <nav className="chef-nav-links">
          <NavLink to="" end className={({ isActive }) => isActive ? "chef-nav-link chef-active" : "chef-nav-link"}>
            <Home size={20} /> {sidebarOpen && <span>Home</span>}
          </NavLink>

          <NavLink to="ChefDashboard" className={({ isActive }) => isActive ? "chef-nav-link chef-active" : "chef-nav-link"}>
            <LayoutDashboard size={20} /> {sidebarOpen && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="OrdersQueue" className={({ isActive }) => isActive ? "chef-nav-link chef-active" : "chef-nav-link"}>
            <ClipboardList size={20} /> {sidebarOpen && <span>Order Queue</span>}
          </NavLink>

          <NavLink to="menu" className={({ isActive }) => isActive ? "chef-nav-link chef-active" : "chef-nav-link"}>
            <UtensilsCrossed size={20} /> {sidebarOpen && <span>Menu Catalog</span>}
          </NavLink>

          <NavLink
            to="inventory"
            className={({ isActive }) => (isActive ? "chef-nav-link chef-active" : "chef-nav-link")}
          >
            <Boxes size={20} /> {sidebarOpen && <span>Inventory</span>}
          </NavLink>
        </nav>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div className="chef-sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main Content */}
      <main className="chef-main">
        <header className="chef-header">
          <div className="chef-header-left">
            <h1 className="chef-page-title">Welcome, {chefName}</h1>
          </div>

          <div className="chef-header-center">
            <div className="chef-restaurant-badge">
              <UtensilsCrossed size={18} />
              <span>{restaurantName}</span>
            </div>
          </div>

          <div className="chef-header-right" ref={dropdownRef}>
            
            {/* Notifications */}
            <div className="chef-notification-wrapper">
              <button className="chef-notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={18} />
                {notifications.some((n) => n.unread) && (
                  <span className="chef-notif-badge">
                    {notifications.filter((n) => n.unread).length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="chef-notif-dropdown">
                  <div className="chef-notif-actions">
                    <button onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}>

                      Mark all read
                    </button>
                    <button onClick={() => setNotifications([])}>Clear</button>
                  </div>

                  <div className="chef-notif-list">
                    {notifications.length === 0 && (
                      <div className="chef-notif-empty">No notifications</div>
                    )}

                    {notifications.map((n) => (
                      <div key={n.id} className={`chef-notif-item ${n.unread ? "chef-unread" : ""}`}>
                        <div className="chef-notif-main" onClick={() => markAsRead(n.id)}>
                          <div className="chef-notif-header">
                            <div className="chef-notif-title">
                              {n.label}
                              {n.priority === "high" && <AlertTriangle size={14} />}
                            </div>
                            <div className="chef-notif-table">{n.table}</div>
                          </div>

                          <div className="chef-notif-details">{n.details}</div>

                          <div className="chef-notif-meta">
                            <span className={`chef-notif-status chef-${n.status.toLowerCase()}`}>
                              {n.status === "New" && <AlertTriangle size={14} />}
                              {n.status === "Preparing" && <FlameKindling size={14} />}
                              {n.status === "Ready" && <CheckCircle2 size={14} />}
                              {n.status}
                            </span>

                            <span className="chef-notif-time">
                              <Clock size={14} /> {n.timeAgo}
                            </span>
                          </div>
                        </div>

                        <div className="chef-notif-controls">
                          {n.unread && <span className="chef-unread-dot" />}
                          <button
                            onClick={() => deleteNotification(n.id)}
                            className="chef-notif-delete-btn"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="chef-profile-circle" onClick={() => setDropdownOpen(!dropdownOpen)}>
              {chefName.charAt(0).toUpperCase()}
            </div>

            {dropdownOpen && (
              <div className="chef-dropdown-menu">
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

        <section className="chef-page-container chef-container">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
