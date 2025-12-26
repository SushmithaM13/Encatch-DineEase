import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ChefHomePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faUtensils,
  faBoxes,
  faCalendarDays
} from "@fortawesome/free-solid-svg-icons";

/* =========================
   DATE FORMAT HELPERS
========================= */
const formatDateForApi = (date) => {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

export default function ChefHomePage() {
  const navigate = useNavigate();
  const TOKEN = localStorage.getItem("token");

  const [chefId, setChefId] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date states
  const today = new Date();
  const [startDate, setStartDate] = useState(formatDateForApi(today));
  const [endDate, setEndDate] = useState(formatDateForApi(today));

  /* =========================
     1. FETCH CHEF PROFILE
  ========================== */
  useEffect(() => {
    if (!TOKEN) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8082/dine-ease/api/v1/staff/profile",
          {
            headers: { Authorization: `Bearer ${TOKEN}` },
          }
        );

        setChefId(res.data.id);
        setOrgId(res.data.organizationId);
      } catch (err) {
        console.error("Profile fetch failed", err);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [TOKEN]);

  /* =========================
     2. FETCH SUMMARY (WITH DATES)
  ========================== */
  useEffect(() => {
    if (!chefId || !orgId) return;

    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:8082/dine-ease/api/v1/chef-notifications/summary/${orgId}/${chefId}`,
          {
            headers: { Authorization: `Bearer ${TOKEN}` },
            params: {
              startDate,
              endDate,
            },
          }
        );

        const d = res.data;

        setStats([
          { icon: "📦", label: "Total Items", value: d.totalItems ?? 0, color: "blue" },
          { icon: "📋", label: "Active Items", value: d.activeItems ?? 0, color: "purple" },
          { icon: "🟢", label: "Accepted", value: d.acceptedItems ?? 0, color: "green" },
          { icon: "⏳", label: "Preparing", value: d.preparingItems ?? 0, color: "orange" },
          { icon: "✅", label: "Completed", value: d.completedItems ?? 0, color: "teal" },
          { icon: "❌", label: "Cancelled", value: d.cancelledItems ?? 0, color: "red" },
          { icon: "🚫", label: "Out Of Stock", value: d.outOfStockItems ?? 0, color: "gray" }
        ]);
      } catch (err) {
        console.error("Summary fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [chefId, orgId, startDate, endDate, TOKEN]);

  /* =========================
     UI
  ========================== */
  return (
    <div className="chef-homepage-wrapper">
      {/* ================= TOP BAR ================= */}
      <div className="chef-top-bar">
        <div className="chef-top-bar-content">
          <div className="chef-greeting">
            <h1 className="chef-title">Welcome Back, Chef 👨‍🍳</h1>
          </div>

          {/* ================= DATE FILTER ================= */}
          <div className="chef-date-filter">
            <FontAwesomeIcon icon={faCalendarDays} className="date-icon" />
            <div className="date-inputs">
              <div className="date-input-group">
                <label>From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
              </div>

              <div className="date-separator">-</div>

              <div className="date-input-group">
                <label>To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      
        {/* ================= HERO SECTION WITH IMAGE ================= */}
        <div className="chef-hero-section">
          <div className="chef-hero-left">
            <p className="hero-description">
              Track orders in real-time, prioritize urgent tickets, and keep your
              menu & inventory in sync — all in one clean workspace.
            </p>
            
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading your dashboard...</p>
              </div>
            ) : (
              <div className="stats-grid">
                {stats.map((s, i) => (
                  <div key={i} className={`stat-card stat-${s.color}`}>
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-details">
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="chef-hero-right">
            <img src="src/Images/chef.png" alt="Chef Illustration" className="chef-image" />
          </div>
        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div className="chef-actions-section">
          <h2 className="section-title">Quick Actions</h2>
          
          <div className="chef-cards-grid">
            <div
              className="chef-feature-card card-yellow"
              onClick={() => navigate("/chefDashboard/OrdersQueue")}
            >
              <div className="card-icon-wrapper">
                <FontAwesomeIcon icon={faClipboardList} className="card-icon" />
              </div>
              <div className="card-content">
                <h3>Order Queue</h3>
                <p>Accept, prepare and complete orders</p>
              </div>
            </div>

            <div
              className="chef-feature-card card-green"
              onClick={() => navigate("/chefDashboard/menu")}
            >
              <div className="card-icon-wrapper">
                <FontAwesomeIcon icon={faUtensils} className="card-icon" />
              </div>
              <div className="card-content">
                <h3>Menu Catalog</h3>
                <p>Manage your menu items</p>
              </div>
            </div>

            <div
              className="chef-feature-card card-red"
              onClick={() => navigate("/chefDashboard/inventory")}
            >
              <div className="card-icon-wrapper">
                <FontAwesomeIcon icon={faBoxes} className="card-icon" />
              </div>
              <div className="card-content">
                <h3>Inventory</h3>
                <p>Track stock and supplies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
}