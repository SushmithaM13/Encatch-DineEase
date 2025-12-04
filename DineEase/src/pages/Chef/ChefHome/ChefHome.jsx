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
  Menu,
  Home,
} from "lucide-react";
import "./ChefHome.css";

export default function ChefHome() {
  const [chefName] = useState(localStorage.getItem("chefName") || "Chef");
  const [restaurantName] = useState("DineEase Restaurant");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const organizationId = "5a812c7d-c96f-4929-823f-86b4a62be304";
  const chefId = 1;
  const token = localStorage.getItem("token");

  // Convert array timestamp → JS Date
  const parseDateArray = (arr) =>
    arr
      ? new Date(
          arr[0],
          arr[1] - 1,
          arr[2],
          arr[3],
          arr[4],
          arr[5],
          Math.floor(arr[6] / 1_000_000)
        )
      : new Date();

  // ===========================
  // FETCH NOTIFICATIONS / ORDERS
  // ===========================
  const fetchNotifications = async () => {
    try {
      if (!token) return console.error("Token missing");

      const res = await fetch(
        `http://localhost:8082/dine-ease/api/v1/chef-notifications/all/${organizationId}/${chefId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const data = await res.json();

      const mapped = data.map((n) => ({
        id: n.chefNotificationId,
        table: n.tableNumber || "Table X",
        time: parseDateArray(n.sentAt).toLocaleTimeString(),
        ago: `${Math.floor((Date.now() - parseDateArray(n.sentAt)) / 60000)} min ago`,
        items: n.orderItemDetails
          .map((item) => `${item.itemQuantity} x ${item.orderItemName}`)
          .join(", "),
        note: n.orderReference,
        urgent: n.notificationType === "HIGH_PRIORITY",
        unread: !n.isRead,
      }));

      setNotifications(mapped);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // ===========================
  // MARK SINGLE NOTIFICATION AS READ
  // ===========================
  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );

    try {
      await fetch(
        `http://localhost:8082/dine-ease/api/v1/chef-notifications/${id}/read`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  // ===========================
  // MARK ALL NOTIFICATIONS AS READ
  // ===========================
  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

    try {
      const unreadIds = notifications.filter((n) => n.unread).map((n) => n.id);
      await Promise.all(
        unreadIds.map((id) =>
          fetch(`http://localhost:8082/dine-ease/api/v1/chef-notifications/${id}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
    } catch (err) {
      console.error("Error marking all notifications read:", err);
    }
  };

  // ===========================
  // OUTSIDE CLICK TO CLOSE DROPDOWN
  // ===========================
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

  // ===========================
  // RESPONSIVE SIDEBAR
  // ===========================
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===========================
  // RENDER
  // ===========================
  return (
    <div className={`chef-layout ${sidebarOpen ? "chef-sidebar-open" : "chef-collapsed"}`}>
      {/* SIDEBAR */}
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
          <NavLink to="" end className={({ isActive }) => (isActive ? "chef-nav-link chef-active" : "chef-nav-link")}>
            <Home size={20} /> {sidebarOpen && <span>Home</span>}
          </NavLink>
          <NavLink to="ChefDashboard" className={({ isActive }) => (isActive ? "chef-nav-link chef-active" : "chef-nav-link")}>
            <LayoutDashboard size={20} /> {sidebarOpen && <span>Dashboard</span>}
          </NavLink>
          <NavLink to="OrdersQueue" className={({ isActive }) => (isActive ? "chef-nav-link chef-active" : "chef-nav-link")}>
            <ClipboardList size={20} /> {sidebarOpen && <span>Order Queue</span>}
          </NavLink>
          <NavLink to="menu" className={({ isActive }) => (isActive ? "chef-nav-link chef-active" : "chef-nav-link")}>
            <UtensilsCrossed size={20} /> {sidebarOpen && <span>Menu Catalog</span>}
          </NavLink>
          <NavLink to="inventory" className={({ isActive }) => (isActive ? "chef-nav-link chef-active" : "chef-nav-link")}>
            <Boxes size={20} /> {sidebarOpen && <span>Inventory</span>}
          </NavLink>
        </nav>
      </aside>

      {/* MOBILE BACKDROP */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div className="chef-sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* MAIN */}
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
            {/* NOTIFICATIONS */}
            <div className="chef-notification-wrapper">
              <button className="chef-notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={18} />
                {notifications.some((n) => n.unread) && (
                  <span className="chef-notif-badge">{notifications.filter((n) => n.unread).length}</span>
                )}
              </button>

              {notifOpen && (
                <div className="chef-notif-dropdown">
                  <div className="chef-notif-actions">
                    <button onClick={markAllAsRead}>Mark all read</button>
                    <button onClick={() => setNotifications([])}>Clear</button>
                  </div>

                  <div className="chef-notif-list">
                    {notifications.length === 0 && <div className="chef-notif-empty">No notifications</div>}

                    {notifications.map((o) => (
                      <div
                        key={o.id}
                        className={`chef-notif-item ${o.urgent ? "chef-urgent" : ""} ${o.unread ? "chef-unread" : ""}`}
                        onClick={() => markAsRead(o.id)}
                      >
                        <div className="chef-order-table">
                          <span>{o.table}</span>
                        </div>
                        <div className="chef-order-items">{o.items}</div>
                        <div className="chef-order-time">{o.time} ({o.ago})</div>
                        <div className="chef-order-note">{o.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE */}
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
