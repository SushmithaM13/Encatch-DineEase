import { useEffect, useState } from "react";
import { Users, Newspaper, Sofa } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminHome.css";

export default function AdminHome() {
  const [adminName, setAdminName] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [organizationId, setOrganizationId] = useState(null);
  const [staff, setStaff] = useState([]);
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);

  const navigate = useNavigate();
  const TOKEN = localStorage.getItem("token");
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";

  // ===== Fetch Admin Profile =====
  useEffect(() => {
    const fetchProfile = async () => {
      if (!TOKEN)
        return toast.error("Token missing! Please login.", {
          position: "top-center",
        });

      try {
        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();

        setOrganizationId(data.organizationId);
        setAdminName(data.firstName || "Admin");
        setRestaurant(data.organizationName || "My Restaurant");
      } catch {
        toast.error("Failed to fetch organization ID", {
          position: "top-center",
        });
      }
    };
    fetchProfile();
  }, [TOKEN]);

  // ===== Fetch Dashboard Data =====
  useEffect(() => {
    if (!organizationId) return;

    const fetchDashboardData = async () => {
      try {
        // Staff
        const staffRes = await fetch(
          `http://localhost:8082/dine-ease/api/v1/staff/all?organizationId=${organizationId}&pageNumber=0&pageSize=10`,
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        const staffData = await staffRes.json();
        const allStaff = staffData.content || staffData || [];
        const nonAdminStaff = allStaff.filter(
          (s) => s.staffRoleName?.toUpperCase() !== "ADMIN"
        );
        setStaff(nonAdminStaff);


        // Menu
        const menuRes = await fetch(
          `http://localhost:8082/dine-ease/api/v1/menu/getAll?organizationId=${organizationId}&pageNumber=0&pageSize=20`,
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );

        const menuData = await menuRes.json();

        // Ensure always array to prevent menu.slice error
        let menuList = [];

        if (Array.isArray(menuData.content)) {
          menuList = menuData.content;
        } else if (Array.isArray(menuData)) {
          menuList = menuData;
        } else {
          menuList = []; 
        }

        setMenu(menuList);



        // Tables
        const tableRes = await fetch(
          `http://localhost:8082/dine-ease/api/v1/restaurant-tables/all/${organizationId}`,
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        const tableData = await tableRes.json();
        setTables(tableData.content || tableData || []);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        toast.error("Failed to load dashboard data", {
          position: "top-center",
        });
      }
    };
    fetchDashboardData();
  }, [organizationId, TOKEN]);

  const occupiedTables = tables.filter((t) => t.tableStatus === "BOOKED").length;

  return (
    <div className="admin-home-dashboard-page">
      <h2 className="admin-home-welcome">Welcome, {adminName}</h2>
      <h3 className="admin-home-restaurant">{restaurant}</h3>

      {/* ===== Stats Cards ===== */}
      <div className="admin-home-stats-cards">
        <div
          className="admin-home-card bounce-card"
          onClick={() => navigate("/AdminDashboard/staff")}
        >
          <Users size={28} className="admin-home-card-icon" />
          <h4>{staff.length}</h4>
          <p>Staff Members</p>
        </div>

        <div
          className="admin-home-card bounce-card"
          onClick={() => navigate("/AdminDashboard/menu")}
        >
          <Newspaper size={28} className="admin-home-card-icon" />
          <h4>{menu.length}</h4>
          <p>Menu Items</p>
        </div>

        <div
          className="admin-home-card bounce-card"
          onClick={() => navigate("/AdminDashboard/table")}
        >
          <Sofa size={28} className="admin-home-card-icon" />
          <h4>
            {occupiedTables}/{tables.length}
          </h4>
          <p>Tables Occupied</p>
        </div>
      </div>

      {/* ===== Staff Preview ===== */}
      <div className="admin-home-preview-section">
        <div className="admin-home-section-header">
          <span>Staff Members</span>
          <button onClick={() => navigate("/AdminDashboard/staff")}>
            View all →
          </button>
        </div>
        <div className="admin-home-preview-list">
          {staff.slice(0, 5).map((s, i) => (
            <div key={i} className="admin-home-preview-card staff-card">
              <Users size={20} color="#0056d2" />
              <div>
                <strong>
                  {s.firstName} {s.lastName}
                </strong>
                <p className="role">{s.staffRoleName || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Menu Preview ===== */}
      <div className="admin-home-preview-section">
        <div className="admin-home-section-header">
          <span>Menu Items</span>
          <button onClick={() => navigate("/AdminDashboard/menu")}>
            View all →
          </button>
        </div>

        <div className="admin-home-preview-list menu-list">
          {menu.slice(0, 5).map((item, i) => (
            <div className="admin-home-menu-card" key={i}>
              <div className="admin-home-image-container">
                <img
                  src={
                    item.imageData
                      ? `data:image/jpeg;base64,${item.imageData}`
                      : "/placeholder-food.jpg"
                  }
                  alt={item.itemName}
                  className="admin-home-menu-image"
                />
                <div
                  className={`admin-home-badge ${item.itemType?.toUpperCase() === "VEG" ? "veg" : "non-veg"
                    }`}
                >
                  {item.itemType || "N/A"}
                </div>
              </div>

              <div className="admin-home-details">
                <h3>{item.itemName}</h3>
                <p className="admin-home-desc">
                  {item.description || "No description available"}
                </p>
                <p className="admin-home-category">
                  {item.categoryName || "Uncategorized"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* ===== Tables Preview ===== */}
      <div className="admin-home-preview-section">
        <div className="admin-home-section-header">
          <span>Restaurant Tables</span>
          <button onClick={() => navigate("/AdminDashboard/table")}>
            View all →
          </button>
        </div>
        <div className="admin-home-preview-list">
          {tables.slice(0, 5).map((t, i) => (
            <div key={i} className="admin-home-preview-card table-card">
              <Sofa size={20} color="#f59e0b" />
              <div>
                <strong>Table {t.tableNumber}</strong>
                <p>Capacity: {t.capacity || "N/A"}</p>
                <span
                  className={`status-tag ${t.tableStatus?.toLowerCase() === "booked"
                    ? "booked"
                    : "available"
                    }`}
                >
                  {t.tableStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
