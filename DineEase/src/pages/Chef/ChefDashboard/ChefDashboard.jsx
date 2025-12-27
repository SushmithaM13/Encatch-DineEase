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
     FETCH NOTIFICATIONS
  ============================ */
  const fetchNotifications = async () => {
    const orgId = localStorage.getItem("orgId");
    const chefId = localStorage.getItem("chefId");
    if (!orgId || !chefId) return;

    try {
      const res = await fetch(
        `http://localhost:8082/dine-ease/api/v1/chef-notifications/all/${orgId}/${chefId}`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );

      if (!res.ok) return;
      const data = await res.json();

      setNotifications(
        data.map((n) => ({
          id: n.chefNotificationId,
          unread: !n.isRead,
          orderRef: n.orderReference,
          tableNumber: n.tableNumber,
          numberOfItems: n.numberOfItems,
          itemName:
            n.orderItemDetails?.[0]?.orderItemName || "N/A",
          quantity:
            n.orderItemDetails?.[0]?.itemQuantity || 0,
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
        { method: "PUT", headers: { Authorization: `Bearer ${TOKEN}` } }
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

  const markAllAsRead = async () => {
    const orgId = localStorage.getItem("orgId");
    const chefId = localStorage.getItem("chefId");

    try {
      await fetch(
        `http://localhost:8082/dine-ease/api/v1/chef-notifications/read-all/${orgId}/${chefId}`,
        { method: "PUT", headers: { Authorization: `Bearer ${TOKEN}` } }
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  /* ===========================
     UI
  ============================ */
  return (
    <div className="ChefDashboard-layout">
      <header className="ChefDashboard-navbar">
        <div className="ChefDashboard-navbar-left">
          <div className="ChefDashboard-brand">
            <UtensilsCrossed size={22} />
            <span>DineEase</span>
          </div>

          {/* NAV LINKS (ALWAYS VISIBLE) */}
          <nav className="ChefDashboard-nav-links">
            <NavLink to="" end className="ChefDashboard-nav-link">
              <Home size={18} /> Home
            </NavLink>

            <NavLink
              to="OrdersQuery"
              className="ChefDashboard-nav-link"
            >
              <ClipboardList size={18} /> Order Query
            </NavLink>

            <NavLink
              to="menu"
              className="ChefDashboard-nav-link"
            >
              <UtensilsCrossed size={18} /> Menu Catalog
            </NavLink>

            <NavLink
              to="inventory"
              className="ChefDashboard-nav-link"
            >
              <Boxes size={18} /> Inventory
            </NavLink>
          </nav>
        </div>

        {/* RIGHT SIDE */}
        <div className="ChefDashboard-header-right" ref={dropdownRef}>
          {/* NOTIFICATIONS */}
          <div className="ChefDashboard-notification-wrapper">
            <button
              className="ChefDashboard-notif-btn"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell size={28} />
              {notifications.some((n) => n.unread) && (
                <span className="ChefDashboard-notif-badge">
                  {
                    notifications.filter(
                      (n) => n.unread
                    ).length
                  }
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="ChefDashboard-notif-dropdown">
                <div className="ChefDashboard-notif-header">
                  <span>Notifications</span>
                  {notifications.some((n) => n.unread) && (
                    <button
                      className="ChefDashboard-read-all-btn"
                      onClick={markAllAsRead}
                    >
                      Read All
                    </button>
                  )}
                </div>

                <div className="ChefDashboard-notif-list">
                  {notifications.length === 0 ? (
                    <div className="ChefDashboard-notif-empty">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`ChefDashboard-notif-item ${
                          n.unread ? "ChefDashboard-unread" : ""
                        }`}
                        onClick={() =>
                          markAsRead(n.id)
                        }
                      >
                        <strong>New Order</strong>
                        <div>
                          <b>Order:</b> {n.orderRef}
                        </div>
                        <div>
                          <b>Table:</b> {n.tableNumber}
                        </div>
                        <div>
                          <b>Item:</b> {n.itemName}
                        </div>
                        <div>
                          <b>Qty:</b> {n.quantity}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PROFILE */}
          <div
            className="ChefDashboard-profile-circle"
            onClick={() =>
              setProfileOpen(!profileOpen)
            }
          >
            {chefName.charAt(0).toUpperCase()}
          </div>

          {profileOpen && (
            <div className="ChefDashboard-dropdown-menu">
              <button
                onClick={() =>
                  navigate("/chefDashboard/profile")
                }
              >
                <User size={16} /> Profile
              </button>
              <button
                onClick={() =>
                  navigate("/chefDashboard/settings")
                }
              >
                <Settings size={16} /> Settings
              </button>
              <button onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="ChefDashboard-main">
        <section className="ChefDashboard-page-container">
          <Outlet />
        </section>
      </main>
    </div>
  );
}