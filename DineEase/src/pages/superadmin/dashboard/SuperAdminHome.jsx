import React, { useEffect, useState } from "react";
import { FaUsers, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./SuperAdminHomepage.css";

const SuperAdminHome = () => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStaff: 0,
    pendingStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
  });

  const [menuStats, setMenuStats] = useState({ totalMenu: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const [editData, setEditData] = useState({});
  const [role, setRole] = useState("");
  const [menuList, setMenuList] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const API_BASE = "http://localhost:8082/dine-ease/api/v1";

  // Fetch staff stats
  const fetchStaffStats = async (orgId, token) => {
    try {
      const response = await fetch(
        `${API_BASE}/staff/all?organizationId=${orgId}&pageNumber=0&pageSize=10&sortBy=asc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

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
    } catch (error) {
      console.error("Error fetching staff stats:", error);
    }
  };

  // Fetch menu stats
  const fetchMenuStats = async (orgId, token) => {
    try {
      const response = await fetch(
        `${API_BASE}/menu/getAll?organizationId=${orgId}&page=0&size=500`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      const menuData = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
        ? data.content
        : [];

      setMenuStats({
        totalMenu: menuData.length,
      });

      setMenuList(menuData);
    } catch (error) {
      console.error("Error fetching menu stats:", error);
    }
  };

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    setRole(userRole);

    if (!token) {
      console.warn("Unauthorized access - redirecting to login");
      navigate("/");
      return;
    }

    if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
      console.warn("Access denied - redirecting to login");
      navigate("/");
      return;
    }

    fetch(`${API_BASE}/admin/organization/get`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((orgData) => {
        setHotel(orgData);
        setEditData(orgData);
        setLoading(false);
        if (orgData?.organizationName) {
          localStorage.setItem("organizationName", orgData.organizationName);
        }
        if (orgData?.FullName) {
          localStorage.setItem("organizationFullName", orgData.FullName);
        }
        if (orgData?.id) {
          localStorage.setItem("organizationId", orgData.id);
          fetchStaffStats(orgData.id, token);
          fetchMenuStats(orgData.id, token);
        }
      })
      .catch((err) => {
        console.error("Error fetching organization:", err);
        setLoading(false);
      });
  }, [navigate]);

  // Listen to staff and menu updates
  useEffect(() => {
    const handleStaffUpdate = () => {
      const orgId = localStorage.getItem("organizationId");
      const token = localStorage.getItem("token");
      if (orgId && token) fetchStaffStats(orgId, token);
    };

    const handleMenuUpdate = () => {
      const orgId = localStorage.getItem("organizationId");
      const token = localStorage.getItem("token");
      if (orgId && token) fetchMenuStats(orgId, token);
    };

    window.addEventListener("staffUpdated", handleStaffUpdate);
    window.addEventListener("menuUpdated", handleMenuUpdate);

    return () => {
      window.removeEventListener("staffUpdated", handleStaffUpdate);
      window.removeEventListener("menuUpdated", handleMenuUpdate);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    fetch(`${API_BASE}/admin/organization/update`, {
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
        localStorage.setItem("organizationName", updatedData.organizationName || "");
        localStorage.setItem("organizationFullName", updatedData.organizationName || "");
        window.dispatchEvent(new Event("storage"));
        alert("Organization details updated successfully!");
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="SuperAdmin-HomePage-dashboard-container">
      <div className="SuperAdmin-HomePage-welcome-header">
        <div>
          <h2 className="SuperAdmin-HomePage-welcome-subtitle">Welcome to Dine_Ease! ! ! ..</h2>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="SuperAdmin-HomePage-stats-grid">
        <div className="SuperAdmin-HomePage-stat-card SuperAdmin-HomePage-blue">
          <div className="SuperAdmin-HomePage-stat-icon-wrapper">
            <FaUsers size={28} />
          </div>
          <div className="SuperAdmin-HomePage-stat-content">
            <h3>{stats.totalStaff}</h3>
            <p>TOTAL STAFF</p>
          </div>
        </div>

        <div className="SuperAdmin-HomePage-stat-card SuperAdmin-HomePage-purple">
          <div className="SuperAdmin-HomePage-stat-icon-wrapper">
            {/* Icon placeholder */}
          </div>
          <div className="SuperAdmin-HomePage-stat-content">
            <h3>{menuStats.totalMenu}</h3>
            <p>TOTAL MENU</p>
          </div>
        </div>

        <div className="SuperAdmin-HomePage-stat-card SuperAdmin-HomePage-cyan">
          <div className="SuperAdmin-HomePage-stat-icon-wrapper">
            {/* Icon placeholder */}
          </div>
          <div className="SuperAdmin-HomePage-stat-content">
            <h3>{stats.activeStaff}</h3>
            <p>ACTIVE STAFF</p>
          </div>
        </div>

        <div className="SuperAdmin-HomePage-stat-card SuperAdmin-HomePage-pink">
          <div className="SuperAdmin-HomePage-stat-icon-wrapper">
            {/* Icon placeholder */}
          </div>
          <div className="SuperAdmin-HomePage-stat-content">
            <h3>{stats.inactiveStaff}</h3>
            <p>INACTIVE STAFF</p>
          </div>
        </div>
      </div>

      {/* Menu List Section */}
      <div className="SuperAdmin-HomePage-menu-grid">
        {menuList.length === 0 ? (
          <p>No menu items yet.</p>
        ) : (
          menuList
            .filter((m) => m.itemName?.toLowerCase().includes(search.toLowerCase()))
            .map((menu) => {
              const price =
                menu.variants && menu.variants.length > 0
                  ? Math.min(...menu.variants.map((v) => Number(v.price || 0)))
                  : "N/A";
              return (
                <div
                  key={menu.id}
                  className="SuperAdmin-HomePage-menu-card"
                  onClick={() => navigate(`/SuperAdminDashboard/menu/${menu.id}`)}
                >
                  <div className="SuperAdmin-HomePage-menu-card-image-wrapper">
                    {menu.imageData ? (
                      <img
                        src={`data:image/jpeg;base64,${menu.imageData}`}
                        alt={menu.itemName}
                        onError={(e) => {
                          e.target.src = "/images/placeholder.png";
                        }}
                      />
                    ) : menu.imageUrl ? (
                      <img
                        src={menu.imageUrl.replace(
                          /C:\\dine-ease-backend\\dine-ease\\uploads\\/g,
                          "http://localhost:8082/dine-ease/uploads/"
                        )}
                        alt={menu.itemName}
                        onError={(e) => {
                          console.log("Image failed:", menu.imageUrl);
                          e.target.src = "/images/placeholder.png";
                        }}
                      />
                    ) : (
                      <img src="/images/placeholder.png" alt="No Image" />
                    )}
                  </div>
                  <div className="SuperAdmin-HomePage-menu-card-content">
                    <h3 className="SuperAdmin-HomePage-menu-card-title">Name: {menu.itemName}</h3>
                    <p className="SuperAdmin-HomePage-menu-card-price">Price: ₹ {price}</p>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Organization Details Section */}
      <div className="SuperAdmin-HomePage-content-row">
        <section className="SuperAdmin-HomePage-organization-section">
          <div className="SuperAdmin-HomePage-section-header">
            <h2>Organization Details</h2>
            {!loading && hotel && role === "SUPER_ADMIN" && (
              <button
                className="SuperAdmin-HomePage-btn-update"
                onClick={() => setShowPopup(true)}
              >
                <FaEdit /> Update
              </button>
            )}
          </div>

          {loading ? (
            <div className="SuperAdmin-HomePage-loading-state">Loading organization...</div>
          ) : hotel ? (
            <div className="SuperAdmin-HomePage-organization-grid">
              <div className="SuperAdmin-HomePage-org-item">
                <span className="SuperAdmin-HomePage-org-label">ID</span>
                <span className="SuperAdmin-HomePage-org-value">{hotel.id || "N/A"}</span>
              </div>
              <div className="SuperAdmin-HomePage-org-item">
                <span className="SuperAdmin-HomePage-org-label">Organization Name</span>
                <span className="SuperAdmin-HomePage-org-value">{hotel.organizationName || "N/A"}</span>
              </div>
              <div className="SuperAdmin-HomePage-org-item">
                <span className="SuperAdmin-HomePage-org-label">Business Type</span>
                <span className="SuperAdmin-HomePage-org-value">{hotel.businessType || "N/A"}</span>
              </div>
              <div className="SuperAdmin-HomePage-org-item">
                <span className="SuperAdmin-HomePage-org-label">Address</span>
                <span className="SuperAdmin-HomePage-org-value">{hotel.organizationAddress || "N/A"}</span>
              </div>
              <div className="SuperAdmin-HomePage-org-item">
                <span className="SuperAdmin-HomePage-org-label">Phone</span>
                <span className="SuperAdmin-HomePage-org-value">{hotel.organizationPhone || "N/A"}</span>
              </div>
              <div className="SuperAdmin-HomePage-org-item">
                <span className="SuperAdmin-HomePage-org-label">Email</span>
                <span className="SuperAdmin-HomePage-org-value">{hotel.organizationEmail || "N/A"}</span>
              </div>
              <div className="SuperAdmin-HomePage-org-item">
                <span className="SuperAdmin-HomePage-org-label">Website</span>
                <span className="SuperAdmin-HomePage-org-value">{hotel.organizationWebsite || "N/A"}</span>
              </div>
              <div className="SuperAdmin-HomePage-org-item">
                <span className="SuperAdmin-HomePage-org-label">Status</span>
                <span className="SuperAdmin-HomePage-org-value SuperAdmin-HomePage-status-badge">{hotel.organizationStatus || "N/A"}</span>
              </div>
              <div className="SuperAdmin-HomePage-org-item">
                <span className="SuperAdmin-HomePage-org-label">GST Number</span>
                <span className="SuperAdmin-HomePage-org-value">{hotel.gstNumber || "N/A"}</span>
              </div>
            </div>
          ) : (
            <div className="SuperAdmin-HomePage-empty-state">No organization data available.</div>
          )}
        </section>
      </div>

      {/* Edit Popup */}
      {showPopup && role === "SUPER_ADMIN" && (
        <div className="SuperAdmin-HomePage-modal-overlay">
          <div className="SuperAdmin-HomePage-modal-content">
            <div className="SuperAdmin-HomePage-modal-header">
              <h3>Edit Organization Details</h3>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="SuperAdmin-HomePage-form-grid">
                <div className="SuperAdmin-HomePage-form-group">
                  <label>Organization Name</label>
                  <input
                    name="organizationName"
                    value={editData.organizationName || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="SuperAdmin-HomePage-form-group">
                  <label>Business Type</label>
                  <input
                    name="businessType"
                    value={editData.businessType || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="SuperAdmin-HomePage-form-group">
                  <label>Address</label>
                  <input
                    name="organizationAddress"
                    value={editData.organizationAddress || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="SuperAdmin-HomePage-form-group">
                  <label>Phone</label>
                  <input
                    name="organizationPhone"
                    value={editData.organizationPhone || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="SuperAdmin-HomePage-form-group">
                  <label>Email</label>
                  <input
                    name="organizationEmail"
                    value={editData.organizationEmail || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="SuperAdmin-HomePage-form-group">
                  <label>Website</label>
                  <input
                    name="organizationWebsite"
                    value={editData.organizationWebsite || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="SuperAdmin-HomePage-form-group SuperAdmin-HomePage-full-width">
                  <label>GST Number</label>
                  <input
                    name="gstNumber"
                    value={editData.gstNumber || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="SuperAdmin-HomePage-modal-footer">
                <button type="button" className="SuperAdmin-HomePage-btn-secondary" onClick={() => setShowPopup(false)}>
                  Cancel
                </button>
                <button type="submit" className="SuperAdmin-HomePage-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminHome;