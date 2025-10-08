import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaUserCheck,
  FaUserSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DashboardHome = () => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStaff: 0,
    pendingStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "SUPER_ADMIN") {
      console.warn("Unauthorized access - redirecting to login");
      navigate("/");
      return;
    }

    // ✅ Fetch staff data
    fetch("http://localhost:8082/dine-ease/api/v1/staff/all", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch staff");
        return res.json();
      })
      .then((data) => {
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
      })
      .catch((err) => console.error("Error fetching staff stats:", err));

    // ✅ Fetch hotel details
    fetch("http://localhost:8082/dine-ease/api/v1/admin/organization/get", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch hotels");
        return res.json();
      })
      .then((data) => {
        setHotel(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching hotels:", err);
        setLoading(false);
      });
  }, [navigate]);

  return (
    <>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>Super Admin Dashboard</h1>
        <div className="stats">
          <div className="stat-card">
            <div className="icon-container">
              <FaUsers size={32} color="#10b981" />
            </div>
            <h3>{stats.totalStaff}</h3>
            <p>Total Staff Members</p>
          </div>
          <div className="stat-card">
            <div className="icon-container">
              <FaUserPlus size={32} color="#f59e0b" />
            </div>
            <h3>{stats.pendingStaff}</h3>
            <p>Pending Staff</p>
          </div>
          <div className="stat-card">
            <div className="icon-container">
              <FaUserCheck size={32} color="#10b981" />
            </div>
            <h3>{stats.activeStaff}</h3>
            <p>Active Staff</p>
          </div>
          <div className="stat-card">
            <div className="icon-container">
              <FaUserSlash size={32} color="#ef4444" />
            </div>
            <h3>{stats.inactiveStaff}</h3>
            <p>Inactive Staff</p>
          </div>
        </div>
      </div>

      {/* Hotel Details */}
     <section className="hotels-section">
        <h2>Hotel Details</h2>
        {loading ? (
          <p>Loading hotel...</p>
        ) : hotel ? (
          <div className="hotel-card">
            <table className="hotel-table">
              <tbody>
                <tr>
                  <th>ID</th>
                  <td>{hotel.id || "N/A"}</td>
                </tr>
                <tr>
                  <th>Organization Name</th>
                  <td>{hotel.organizationName || "N/A"}</td>
                </tr>
                <tr>
                  <th>Business Type</th>
                  <td>{hotel.businessType || "N/A"}</td>
                </tr>
                <tr>
                  <th>Address</th>
                  <td>{hotel.organizationAddress || "N/A"}</td>
                </tr>
                <tr>
                  <th>Phone</th>
                  <td>{hotel.organizationPhone || "N/A"}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{hotel.organizationEmail || "N/A"}</td>
                </tr>
                <tr>
                  <th>Website</th>
                  <td>{hotel.organizationWebsite || "N/A"}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>{hotel.organizationStatus || "N/A"}</td>
                </tr>
                <tr>
                  <th>GST Number</th>
                  <td>{hotel.gstNumber || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hotel data available.</p>
        )}
      </section>
    </>
  );
};

export default DashboardHome;
