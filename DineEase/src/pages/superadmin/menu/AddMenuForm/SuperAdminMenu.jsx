import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMenus } from "./Api/menuApi";
import "./SuperAdminMenu.css";

export default function SuperAdminMenu() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load menus from API
  useEffect(() => {
    async function loadMenus() {
      setLoading(true);
      setError(null);

      try {
        const orgId = localStorage.getItem("organizationId");
        if (!orgId) {
          alert("Organization ID not found. Redirecting to dashboard...");
          navigate("/SuperAdminDashboard/home");
          return;
        }

        const data = await getAllMenus(orgId);
        if (!data || !Array.isArray(data)) {
          setMenus([]);
          console.warn("Menus API returned empty or invalid data");
          return;
        }

        setMenus(data);
      } catch (err) {
        console.error("Failed to fetch menus:", err);
        setError("Failed to fetch menus. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadMenus();
  }, [navigate]);

  if (loading) return <p className="loading-text">Loading menus...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="Superadmin-menu-container">
      <div className="Superadmin-menu-header">
        <h2>Menu List</h2>
        <button
          className="Superadmin-menu-add-menu-btn"
          onClick={() => navigate("/SuperAdminDashboard/menu/add")}
        >
          ➕ Add Menu
        </button>
      </div>

      <div className="Superadmin-menu-menu-grid">
        {menus.length === 0 ? (
          <p>No menus found</p>
        ) : (
          menus.map((menu) => (
            <div
              key={menu.id}
              className="Superadmin-menu-menu-card"
              onClick={() =>
                navigate(`/SuperAdminDashboard/menu/details/${menu.id}`, {
                  state: { menu },
                })
              }
            >
              <img
                src={
                  menu.imageData
                    ? `data:image/jpeg;base64,${menu.imageData}`
                    : "/default-menu.png"
                }
                alt={menu.itemName || "Menu Item"}
                className="Superadmin-menu-menu-image"
              />

              <div className="Superadmin-menu-card-content">
                <h3>{menu.itemName || "Untitled Item"}</h3>
                <p>Category: {menu.categoryName || "N/A"}</p>
                <p>Price: {menu.price != null ? menu.price : "N/A"}</p>
                <p>Cuisine: {menu.cuisineTypeName || "N/A"}</p>
                <span className="Superadmin-menu-view-more">View Details →</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
