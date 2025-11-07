import React, { useState } from "react";
import "./ChefDashboard.css";

export default function ChefDashboard() {
  const [stats] = useState([
    {
      icon: "📋",
      value: 12,
      label: "Active Orders",
      color: "var(--primary)",
    },
    {
      icon: "⏱",
      value: 8,
      label: "Pending Preparation",
      color: "var(--secondary)",
    },
    {
      icon: "✅",
      value: 15,
      label: "Completed Today",
      color: "#2E7D32",
    },
    {
      icon: "❌",
      value: 3,
      label: "Out of Stock Items",
      color: "var(--accent)",
    },
  ]);

  return (
    <div className="chef-dashboard container">
      <h2 className="section-title">Kitchen Overview</h2>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="chef-welcome">
        <h3>Welcome back, Chef!</h3>
        <p>
          Here's a quick summary of today's kitchen activity. You can monitor
          orders, manage menu stock, and update inventory in real time from the
          sidebar.
        </p>
      </div>
    </div>
  );
}
