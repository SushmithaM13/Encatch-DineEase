import React, { useState, useEffect } from "react";
import "./SuperAdminDashboard.css";
import UserManagement from "../usermanagement/UserManagement";
import Items from "../items/FoodItems";
import {
  FaUsers,
  FaUserPlus,
  FaUserCheck,
  FaUserSlash,
  FaBars,
  FaHome,
  FaUserCircle,
  FaUtensils,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const SuperAdminDashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ Load users from localStorage
  useEffect(() => {
    const loadUsers = () => {
      const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
      setUsers(localUsers);
    };

    loadUsers();

    const handleUserAdded = (e) => setUsers(e.detail.users);
    const handleUserDeleted = (e) => setUsers(e.detail.users);
    const handleUserUpdated = (e) => setUsers(e.detail.users);

    window.addEventListener("userAdded", handleUserAdded);
    window.addEventListener("userDeleted", handleUserDeleted);
    window.addEventListener("userUpdated", handleUserUpdated);

    return () => {
      window.removeEventListener("userAdded", handleUserAdded);
      window.removeEventListener("userDeleted", handleUserDeleted);
      window.removeEventListener("userUpdated", handleUserUpdated);
    };
  }, []);

  // ✅ Load hotels from localStorage (or replace with API later)
  useEffect(() => {
    const storedHotels = JSON.parse(localStorage.getItem("hotels") || "[]");
    setHotels(storedHotels);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [mobileMenuOpen]);

  const handleMobileMenuToggle = () => setMobileMenuOpen(!mobileMenuOpen);
  const handleMobileMenuClose = () => setMobileMenuOpen(false);
  const handleDesktopSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  // Stats
  const totalStaff = users.length;
  const activeUsers = users.filter(
    (u) => u.status?.toLowerCase() === "active"
  ).length;
  const inactiveUsers = users.filter((u) =>
    ["inactive", "pending"].includes((u.status || "").toLowerCase())
  ).length;
  const pendingInvites = users.filter(
    (u) => u.status?.toLowerCase() === "pending"
  ).length;

  return (
    <div className={`dashboard ${sidebarOpen ? "expanded" : "collapsed"}`}>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={handleMobileMenuClose}
      ></div>

      {/* Sidebar */}
      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"
        } ${mobileMenuOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <h2 className="logo">{sidebarOpen ? "Super Admin" : "SA"}</h2>
          <button className="toggle-btn" onClick={handleDesktopSidebarToggle}>
            {/* icon optional */}
          </button>
        </div>
        <ul>
          <li>
            <FaHome /> {sidebarOpen && <span>Dashboard</span>}
          </li>
          <li>
            <FaUsers /> {sidebarOpen && <span>Users</span>}
          </li>
          <li>
            <FaUtensils /> {sidebarOpen && <span>Food Items</span>}
          </li>
          <li>
            <FaCog /> {sidebarOpen && <span>Settings</span>}
          </li>
          <li>
            <FaSignOutAlt /> {sidebarOpen && <span>Logout</span>}
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="topbar">
          <button className="menu-btn" onClick={handleMobileMenuToggle}>
            <FaBars size={22} />
          </button>
          <div className="profile-info">
            <FaUserCircle size={30} className="profile-icon" />
            <span className="profile-name">Super Admin</span>
          </div>
        </div>

        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1>Super Admin Dashboard</h1>
          <div className="stats">
            <div className="stat-card">
              <div className="icon-container">
                <FaUsers size={32} color="#10b981" />
              </div>
              <h3>{totalStaff}</h3>
              <p>Total Staff Members</p>
            </div>
            <div className="stat-card">
              <div className="icon-container">
                <FaUserPlus size={32} color="#f59e0b" />
              </div>
              <h3>{pendingInvites}</h3>
              <p>Pending Users</p>
            </div>
            <div className="stat-card">
              <div className="icon-container">
                <FaUserCheck size={32} color="#10b981" />
              </div>
              <h3>{activeUsers}</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-card">
              <div className="icon-container">
                <FaUserSlash size={32} color="#ef4444" />
              </div>
              <h3>{inactiveUsers}</h3>
              <p>Inactive Users</p>
            </div>
          </div>
        </div>

        {/* User Management */}
        <UserManagement />
        <Items />

        {/* Hotel Details */}
        <section className="hotels-section">
          <h2>Hotel Details</h2>
          <div className="hotel-list">
            {hotels.length > 0 ? (
              hotels.map((hotel, idx) => (
                <div key={hotel.id || idx} className="hotel-card">
                  <h3>{hotel.hotelName || hotel.name}</h3>
                  <div className="hotel-details">
                    <p>
                      <strong>Owner:</strong> {hotel.ownerName || "N/A"}
                    </p>
                    <p>
                      <strong>Hotel Name:</strong> {hotel.HotelName || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong> {hotel.email || "N/A"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {hotel.phone || "N/A"}
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {hotel.location || hotel.city || "N/A"}
                    </p>
                    <p>
                      <strong>Address:</strong> {hotel.address || "N/A"}
                    </p>
                    <p>
                      <strong>Registration Date:</strong>{" "}
                      {hotel.registrationDate || hotel.createdAt || "N/A"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>
                  No hotel data available. Hotels will appear here when owners
                  sign up.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
