import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  UtensilsCrossed,
  Boxes,
  LogOut,
  Settings,
  User,
  Bell,
  Menu,
  Home,
} from "lucide-react";
import "./ChefDashboard.css";

export default function ChefDashboard() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const TOKEN = localStorage.getItem("token");

  const [chefName, setChefName] = useState(
    localStorage.getItem("chefName") || "Chef"
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  /* ===========================
     FETCH CHEF PROFILE
  ============================ */
  const fetchChefProfile = async () => {
    try {
      const res = await fetch(
        "http://localhost:8082/dine-ease/api/v1/staff/profile",
        {
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );

      if (!res.ok) return;

      const data = await res.json();

      if (data.organizationId)
        localStorage.setItem("orgId", data.organizationId);
      if (data.id) localStorage.setItem("chefId", data.id);
      if (data.staffName) {
        setChefName(data.staffName);
        localStorage.setItem("chefName", data.staffName);
      }

      fetchNotifications();
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  /* ===========================
     FETCH NOTIFICATIONS (FIXED)
  ============================ */
  const fetchNotifications = async () => {
    const orgId = localStorage.getItem("orgId");
    const chefId = localStorage.getItem("chefId");
    if (!orgId || !chefId) return;

    try {
      const res = await fetch(
        `http://localhost:8082/dine-ease/api/v1/chef-notifications/all/${orgId}/${chefId}`,
        {
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );

      if (!res.ok) return;

      const data = await res.json();

      setNotifications(
        data.map((n) => ({
          id: n.chefNotificationId, // ✅ correct ID
          unread: !n.isRead,

          // ✅ ORDER DETAILS FROM API
          orderRef: n.orderReference,
          tableNumber: n.tableNumber,
          numberOfItems: n.numberOfItems,
          itemName: n.orderItemDetails?.[0]?.orderItemName || "N/A",
          quantity: n.orderItemDetails?.[0]?.itemQuantity || 0,
        }))
      );
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  /* ===========================
     MARK AS READ
  ============================ */
  const markAsRead = async (id) => {
    try {
      await fetch(
        `http://localhost:8082/dine-ease/api/v1/chef-notifications/${id}/read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, unread: false } : n
        )
      );
    } catch (err) {
      console.error("Read failed", err);
    }
  };

  /* ===========================
     READ ALL
  ============================ */
  const markAllAsRead = async () => {
    const orgId = localStorage.getItem("orgId");
    const chefId = localStorage.getItem("chefId");

    try {
      await fetch(
        `http://localhost:8082/dine-ease/api/v1/chef-notifications/read-all/${orgId}/${chefId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, unread: false }))
      );
    } catch (err) {
      console.error("Read all failed", err);
    }
  };

  /* ===========================
     EFFECTS
  ============================ */
  useEffect(() => {
    if (TOKEN) fetchChefProfile();
  }, [TOKEN]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  /* ===========================
     UI
  ============================ */
  return (
    <div className={`chef-layout ${sidebarOpen ? "open" : "collapsed"}`}>
      {/* SIDEBAR */}
      <aside className="chef-sidebar">
        <div className="chef-sidebar-header">
          <div className="chef-brand">
            <UtensilsCrossed size={22} />
            {sidebarOpen && <span>DineEase</span>}
          </div>
          <button
            className="chef-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="chef-nav-links">
          <NavLink to="" end className="chef-nav-link">
            <Home size={20} /> {sidebarOpen && "Home"}
          </NavLink>
          <NavLink to="OrdersQueue" className="chef-nav-link">
            <ClipboardList size={20} /> {sidebarOpen && "Order Queue"}
          </NavLink>
          <NavLink to="menu" className="chef-nav-link">
            <UtensilsCrossed size={20} /> {sidebarOpen && "Menu Catalog"}
          </NavLink>
          <NavLink to="inventory" className="chef-nav-link">
            <Boxes size={20} /> {sidebarOpen && "Inventory"}
          </NavLink>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="chef-main">
        <header className="chef-header">
          <h1>Welcome, {chefName}</h1>

          <div className="chef-header-right" ref={dropdownRef}>
            {/* NOTIFICATIONS */}
            <div className="chef-notification-wrapper">
              <button
                className="chef-notif-btn"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={18} />
                {notifications.some((n) => n.unread) && (
                  <span className="chef-notif-badge">
                    {notifications.filter((n) => n.unread).length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="chef-notif-dropdown">
                  <div className="chef-notif-header">
                    <span>Notifications</span>
                    {notifications.some((n) => n.unread) && (
                      <button
                        className="chef-read-all-btn"
                        onClick={markAllAsRead}
                      >
                        Read All
                      </button>
                    )}
                  </div>

                  <div className="chef-notif-list">
                    {notifications.length === 0 ? (
                      <div className="chef-notif-empty">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`chef-notif-item ${
                            n.unread ? "chef-unread" : ""
                          }`}
                          onClick={() => markAsRead(n.id)}
                        >
                          <strong>New Order</strong>
                          <div><b>Order Ref:</b> {n.orderRef}</div>
                          <div><b>Table:</b> {n.tableNumber}</div>
                          <div><b>Item:</b> {n.itemName}</div>
                          <div><b>Qty:</b> {n.quantity}</div>
                          <div><b>Total Items:</b> {n.numberOfItems}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE */}
            <div
              className="chef-profile-circle"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              {chefName.charAt(0).toUpperCase()}
            </div>

            {profileOpen && (
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

        <section className="chef-page-container">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
