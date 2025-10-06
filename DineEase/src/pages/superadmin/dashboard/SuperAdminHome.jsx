import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaUserCheck,
  FaUserSlash,
  FaEdit,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./SuperAdminDashboard.css";

const DashboardHome = () => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStaff: 0,
    pendingStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
  });
  const [showPopup, setShowPopup] = useState(false);
  const [editData, setEditData] = useState({});

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
      .then((res) => res.json())
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
      .then((res) => res.json())
      .then((data) => {
        setHotel(data);
        setEditData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching hotels:", err);
        setLoading(false);
      });
  }, [navigate]);

  // ✅ Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Update API call
  const handleUpdate = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    fetch("http://localhost:8082/dine-ease/api/v1/admin/organization/update", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update failed");
        return res.json();
      })
      .then((updatedData) => {
        setHotel(updatedData);
        setShowPopup(false);
        alert("Organization details updated successfully!");
      })
      .catch((err) => console.error("Error updating:", err));
  };

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

      {/* Hotel Details Section */}
      <section className="hotels-section">
        <h2>
          Hotel Details{" "}
          {!loading && hotel && (
            <button
              className="update-btn"
              onClick={() => setShowPopup(true)}
              title="Edit Organization Details"
            >
              <FaEdit /> Update
            </button>
          )}
        </h2>

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

      {/* ✅ Popup Form */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Edit Organization Details</h3>
            <form onSubmit={handleUpdate}>
              <label>Organization Name:</label>
              <input
                name="organizationName"
                value={editData.organizationName || ""}
                onChange={handleChange}
                required
              />
              <label>Business Type:</label>
              <input
                name="businessType"
                value={editData.businessType || ""}
                onChange={handleChange}
              />
              <label>Address:</label>
              <input
                name="organizationAddress"
                value={editData.organizationAddress || ""}
                onChange={handleChange}
              />
              <label>Phone:</label>
              <input
                name="organizationPhone"
                value={editData.organizationPhone || ""}
                onChange={handleChange}
              />
              <label>Email:</label>
              <input
                name="organizationEmail"
                value={editData.organizationEmail || ""}
                onChange={handleChange}
              />
              <label>Website:</label>
              <input
                name="organizationWebsite"
                value={editData.organizationWebsite || ""}
                onChange={handleChange}
              />
              <label>GST Number:</label>
              <input
                name="gstNumber"
                value={editData.gstNumber || ""}
                onChange={handleChange}
              />
              <div className="popup-buttons">
                <button type="submit" className="save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHome;
