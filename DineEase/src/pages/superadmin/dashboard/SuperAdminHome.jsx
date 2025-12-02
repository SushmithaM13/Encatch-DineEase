import React, { useEffect, useState } from "react";
import {
  FaUsers,

  FaEdit,

} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./SuperAdminDashboard.css";

const SuperAdminHome = () => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStaff: 0,
    pendingStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
  });


  const [menuStats, setMenuStats] = useState({ totalMenu: 0, });
  const [showPopup, setShowPopup] = useState(false);
  const [editData, setEditData] = useState({});
  const [role, setRole] = useState("");
  const [menuList, setMenuList] = useState([]);
  const [search, setSearch] = useState("");



  const navigate = useNavigate();
  const API_BASE = "http://localhost:8082/dine-ease/api/v1";

  // ----------------- STAFF STATS -----------------

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

  // ----------------- MENU STATS -----------------

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

  // ----------------- INITIAL LOAD -----------------

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

  // ----------------- LISTEN TO STAFF AND MENU UPDATES -----------------

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

  // ----------------- RENDER -----------------

  return (
    <div className="dashboard-container">

      <div className="welcome-header">
        <div>
          <h2 className="welcome-subtitle">Welcome to Dine_Ease ! ! ! ..</h2>
        </div>

      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon-wrapper">
            <FaUsers size={28} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalStaff}</h3>
            <p>TOTAL STAFF</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon-wrapper">
            {/* <FaUtensils size={28} /> */}
          </div>
          <div className="stat-content">
            <h3>{menuStats.totalMenu}</h3>
            <p>TOTAL MENU</p>
          </div>
        </div>


        <div className="stat-card cyan">
          <div className="stat-icon-wrapper">
            {/* <FaShoppingCart size={28} /> */}
          </div>
          <div className="stat-content">
            <h3>{stats.activeStaff}</h3>
            <p>ACTIVE STAFF</p>
          </div>
        </div>

        <div className="stat-card pink">
          <div className="stat-icon-wrapper">
            {/* <FaUsers size={28} /> */}
          </div>
          <div className="stat-content">
            <h3>{stats.inactiveStaff}</h3>
            <p>INACTIVE STAFF</p>
          </div>
        </div>
      </div>



      {/* ================== MENU LIST SECTION ================== */}
      <div className="menu-grid">
        {menuList.length === 0 ? (
          <p>No menu items yet.</p>
        ) : (
          menuList
            .filter((m) => m.itemName?.toLowerCase().includes(search.toLowerCase()))
            .map((menu) => {
              const imageUrl = menu.imageData
                ? `data:image/jpeg;base64,${menu.imageData}`
                : menu.imageUrl
                  ? menu.imageUrl.replace(
                    /C:\\\\dine-ease-backend\\\\dine-ease\\\\uploads\\\\/g,
                    "http://localhost:8082/dine-ease/uploads/"
                  )
                  : "/images/placeholder.png";


              const price =
                menu.variants && menu.variants.length > 0
                  ? Math.min(...menu.variants.map((v) => Number(v.price || 0)))
                  : "N/A";
              return (
                <div
                  key={menu.id}
                  className="menu-card"
                  onClick={() => navigate(`/SuperAdminDashboard/menu/${menu.id}`)}
                >
                  <div className="menu-card-image-wrapper">
                   {menu.imageData ? (
      <img
        src={`data:image/jpeg;base64,${menu.imageData}`}
        alt={menu.itemName}
        style={{ width: "200px", height: "150px", border: "1px solid red" }}
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
        style={{ width: "200px", height: "150px", border: "1px solid red" }}
        onError={(e) => {
          console.log("Image failed:", menu.imageUrl);
          e.target.src = "/images/placeholder.png";
        }}
      />
    ) : (
      <img
        src="/images/placeholder.png"
        alt="No Image"
        style={{ width: "200px", height: "150px", border: "1px solid red" }}
      />
    )}
                  </div>
                  <div className="menu-card-content">
                    <h3 className="menu-card-title">Name:{menu.itemName}</h3>
                    <p className="menu-card-price">Price-₹ {price}</p>
                  </div>
                </div>

              );
            })
        )}
      </div>

      {/* Organization Details Section */}
      <div className="content-row">
        <section className="organization-section">
          <div className="section-header">
            <h2>Organization Details</h2>
            {!loading && hotel && role === "SUPER_ADMIN" && (
              <button
                className="btn-update"
                onClick={() => setShowPopup(true)}
              >
                <FaEdit /> Update
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-state">Loading organization...</div>
          ) : hotel ? (
            <div className="organization-grid">
              <div className="org-item">
                <span className="org-label">ID</span>
                <span className="org-value">{hotel.id || "N/A"}</span>
              </div>
              <div className="org-item">
                <span className="org-label">Organization Name</span>
                <span className="org-value">{hotel.organizationName || "N/A"}</span>
              </div>
              <div className="org-item">
                <span className="org-label">Business Type</span>
                <span className="org-value">{hotel.businessType || "N/A"}</span>
              </div>
              <div className="org-item">
                <span className="org-label">Address</span>
                <span className="org-value">{hotel.organizationAddress || "N/A"}</span>
              </div>
              <div className="org-item">
                <span className="org-label">Phone</span>
                <span className="org-value">{hotel.organizationPhone || "N/A"}</span>
              </div>
              <div className="org-item">
                <span className="org-label">Email</span>
                <span className="org-value">{hotel.organizationEmail || "N/A"}</span>
              </div>
              <div className="org-item">
                <span className="org-label">Website</span>
                <span className="org-value">{hotel.organizationWebsite || "N/A"}</span>
              </div>
              <div className="org-item">
                <span className="org-label">Status</span>
                <span className="org-value status-badge">{hotel.organizationStatus || "N/A"}</span>
              </div>
              <div className="org-item">
                <span className="org-label">GST Number</span>
                <span className="org-value">{hotel.gstNumber || "N/A"}</span>
              </div>
            </div>
          ) : (
            <div className="empty-state">No organization data available.</div>
          )}
        </section>
      </div>

      {/* Edit Popup */}
      {showPopup && role === "SUPER_ADMIN" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Organization Details</h3>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Organization Name</label>
                  <input
                    name="organizationName"
                    value={editData.organizationName || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Business Type</label>
                  <input
                    name="businessType"
                    value={editData.businessType || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    name="organizationAddress"
                    value={editData.organizationAddress || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    name="organizationPhone"
                    value={editData.organizationPhone || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    name="organizationEmail"
                    value={editData.organizationEmail || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input
                    name="organizationWebsite"
                    value={editData.organizationWebsite || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group full-width">
                  <label>GST Number</label>
                  <input
                    name="gstNumber"
                    value={editData.gstNumber || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowPopup(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
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