import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaUserCheck,
  FaUserSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DashboardHome = () => {
  // const [stats, setStats] = useState({
  //   totalStaff: 0,
  //   pendingInvites: 0,
  //   activeUsers: 0,
  //   inactiveUsers: 0,
  // });
  const [hotel, setHotels] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 🔑 Get token dynamically from localStorage
    const token = localStorage.getItem("token"); // or sessionStorage.getItem("token")
    const role = localStorage.getItem("role");
    console.log("Token used:", token);

    if (!token || role !== "SUPER_ADMIN") {
      console.warn("Unauthorized access - redirecting to login");
      navigate("/");
      return;
    }

    // ✅ Fetch staff stats
    // fetch("http://localhost:8080/api/staff/stats", {
    //   method: "GET",
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //     "Content-Type": "application/json",
    //   },
    // })
    //   .then((res) => {
    //     if (!res.ok) throw new Error("Failed to fetch staff stats");
    //     return res.json();
    //   })
    //   .then((data) => {
    //     setStats({
    //       totalStaff: data.totalStaff || 0,
    //       pendingInvites: data.pendingInvites || 0,
    //       activeUsers: data.activeUsers || 0,
    //       inactiveUsers: data.inactiveUsers || 0,
    //     });
    //   })
    //   .catch((err) => console.error("Error fetching staff stats:", err));

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
        console.log("status code:", res.status)
        if (!res.ok) throw new Error("Failed to fetch hotels");
        return res.json();
      })
      .then((data) => {
        console.log("data fetch",data)
        setHotels(data);
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
            {/* <h3>{stats.totalStaff}</h3> */}
            <p>Total Staff Members</p>
          </div>
          <div className="stat-card">
            <div className="icon-container">
              <FaUserPlus size={32} color="#f59e0b" />
            </div>
            {/* <h3>{stats.pendingInvites}</h3> */}
            <p>Pending Staff </p>
          </div>
          <div className="stat-card">
            <div className="icon-container">
              <FaUserCheck size={32} color="#10b981" />
            </div>
            {/* <h3>{stats.activeUsers}</h3> */}
            <p>Active Staff</p>
          </div>
          <div className="stat-card">
            <div className="icon-container">
              <FaUserSlash size={32} color="#ef4444" />
            </div>
            {/* <h3>{stats.inactiveUsers}</h3> */}
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
            <h3>{hotel.organizationName}</h3>
            <div className="hotel-details">
              <p><strong>ID:</strong> {hotel.id || "N/A"}</p>
              <p><strong>Business Type:</strong> {hotel.businessType || "N/A"}</p>
              <p><strong>Address:</strong> {hotel.organizationAddress || "N/A"}</p>
              <p><strong>Phone:</strong> {hotel.organizationPhone || "N/A"}</p>
              <p><strong>Email:</strong> {hotel.organizationEmail || "N/A"}</p>
              <p><strong>Website:</strong> {hotel.organizationWebsite || "N/A"}</p>
              <p><strong>Status:</strong> {hotel.organizationStatus || "N/A"}</p>
              <p><strong>GST Number:</strong> {hotel.gstNumber || "N/A"}</p>
            </div>
          </div>
        ) : (
          <p>No hotel data available.</p>
        )}
      </section>
    </>
  );
};

export default DashboardHome;
