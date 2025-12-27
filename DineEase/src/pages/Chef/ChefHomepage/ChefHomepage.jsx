import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ChefHomePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faUtensils,
  faBoxes,
  faCalendarDays,
  faChartLine,
  faClock,
} from "@fortawesome/free-solid-svg-icons";


/* ================= DATE FORMAT ================= */
const formatDateForApi = (date) => date.toISOString().split("T")[0];

export default function ChefHomePage() {
  const navigate = useNavigate();
  const TOKEN = localStorage.getItem("token");

  const today = new Date();
  const [startDate, setStartDate] = useState(formatDateForApi(today));
  const [endDate, setEndDate] = useState(formatDateForApi(today));

  const [chefId, setChefId] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [loading, setLoading] = useState(true);
 
  const [chefName, setChefName] = useState("");
  const [orgName, setOrgName] = useState("");


  const [stats, setStats] = useState([
    { label: "Total Orders", value: 0, icon: faChartLine, color: "amber" },
    { label: "Active Orders", value: 0, icon: faClock, color: "purple" },
    { label: "Accepted", value: 0, icon: faClipboardList, color: "green" },
    { label: "Preparing", value: 0, icon: faUtensils, color: "orange" },
    { label: "Completed", value: 0, icon: faBoxes, color: "cyan" },
    { label: "Cancelled", value: 0, icon: faClipboardList, color: "red" },
    { label: "OutofStock", value: 0, icon: faChartLine, color: "brown" }
  ]);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!TOKEN) return;

    axios
      .get("http://localhost:8082/dine-ease/api/v1/staff/profile", {
        headers: { Authorization: `Bearer ${TOKEN}` },
      })
      .then((res) => {
        setChefId(res.data.id);
        setOrgId(res.data.organizationId);

        // ✅ Use fullName from profile API
        setChefName(res.data.fullName || "Full Name");
        setOrgName(res.data.organizationName || "Organization");
      })
      .catch(console.error);
  }, [TOKEN]);


  /* ================= FETCH SUMMARY ================= */
  useEffect(() => {
    if (!chefId || !orgId) return;

    setLoading(true);

    axios
      .get(
        `http://localhost:8082/dine-ease/api/v1/chef-notifications/summary/${orgId}/${chefId}`,
        {
          headers: { Authorization: `Bearer ${TOKEN}` },
          params: { startDate, endDate },
        }
      )
      .then((res) => {
        const d = res.data;
        setStats((prev) =>
          prev.map((card) => {
            const map = {
              "Total Orders": d.totalItems,
              "Active Orders": d.activeItems,
              Accepted: d.acceptedItems,
              Preparing: d.preparingItems,
              Completed: d.completedItems,
              Cancelled: d.cancelledItems,
              OutofStock: d.OutofStock,
            };
            return { ...card, value: map[card.label] ?? 0 };
          })
        );
      })
      .finally(() => setLoading(false));
  }, [chefId, orgId, startDate, endDate, TOKEN]);

  /* ================= CLOCK ================= */
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="ChefHome-dashboard">
      {/* HEADER */}
      <header className="ChefHome-dashboard-top">
        <div>
          <h1 className="ChefHome-dashboard-title">Kitchen Command Center</h1>
          <h3>Welcome Back, {chefName || "Full Name"} 👨‍🍳</h3>

          <p className="ChefHome-dashboard-subtitle">
            Master your culinary operations with precision
          </p>
        </div>

        <div className="ChefHome-header-center">
          <h2 className="ChefHome-organization-name">{orgName || "Organization"}</h2>
        </div>

        <div className="ChefHome-top-datetime">
          <FontAwesomeIcon icon={faCalendarDays} />
          <span>{currentTime.toDateString()}</span>
          <FontAwesomeIcon icon={faClock} />
          <strong>{currentTime.toLocaleTimeString()}</strong>
        </div>
      </header>


      {/* MAIN */}
      <section className="ChefHome-dashboard-main-grid">
        {/* LEFT : STATS */}

        <div className="ChefHome-stats-grid">

          {stats.map((s, i) => (
            <div key={i} className={`ChefHome-stat-card ChefHome-${s.color}`}>

              <FontAwesomeIcon icon={s.icon} />
              <h2>{loading ? "…" : s.value}</h2>
              <p>{s.label}</p>
            </div>
          ))}
        </div>

        {/* RIGHT : DATE + IMAGE */}
        <div className="ChefHome-right-panel">
          <div className="ChefHome-date-filter">
            <div>
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="ChefHome-chef-image-container">
            <img src="src/Images/chef.png" alt="Chef" />
          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="ChefHome-quick-access-section">
        <h2>Quick Access</h2>
        <div className="ChefHome-quick-access-row">
          <div onClick={() => navigate("/chefDashboard/OrdersQuery")} className="ChefHome-quick-card">
            <FontAwesomeIcon icon={faClipboardList} /> Order Query
          </div>
          <div onClick={() => navigate("/chefDashboard/menu")} className="ChefHome-quick-card">
            <FontAwesomeIcon icon={faUtensils} /> Menu
          </div>
          <div onClick={() => navigate("/chefDashboard/inventory")} className="ChefHome-quick-card">
            <FontAwesomeIcon icon={faBoxes} /> Inventory
          </div>
        </div>
      </section>
    </div>
  );
}