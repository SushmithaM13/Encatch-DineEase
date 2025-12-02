import React, { useEffect, useState } from "react";
import "./ChefMenuCatalog.css";

export default function ChefMenuCatalog() {
  const API_PROFILE = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const API_MENU = "http://localhost:8082/dine-ease/api/v1/menu/getAll";

  const [token, setToken] = useState(localStorage.getItem("jwtToken"));
  const [organizationId, setOrganizationId] = useState(
    localStorage.getItem("chefOrgId")
  );

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===================================================================================
  // 1️⃣ FETCH STAFF PROFILE → GET ORGANIZATION ID
  // ===================================================================================
  const fetchStaffProfile = async () => {
    try {
      if (!token) {
        console.log("⏳ Waiting for token...");
        return;
      }

      const res = await fetch(API_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("❌ Profile API failed");
        return;
      }

      const data = await res.json();
      console.log("👨‍🍳 Staff Profile:", data);

      if (data.organizationId) {
        localStorage.setItem("chefOrgId", data.organizationId);
        setOrganizationId(data.organizationId);
      } else {
        console.error("❌ No organizationId found in profile response!");
      }
    } catch (err) {
      console.error("❌ Staff Profile Fetch Error:", err);
    }
  };

  // ===================================================================================
  // 2️⃣ FETCH MENU ITEMS USING ORGANIZATION ID
  // ===================================================================================
  const fetchMenuItems = async (orgId) => {
    try {
      const url = `${API_MENU}?organizationId=${orgId}&page=0&size=20`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("❌ Menu API failed");
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("🍽 Menu Items:", data);

      const formatted = data?.content?.map((item) => ({
        id: item.id,
        name: item.itemName,
        desc: item.description,
        price: item.price,
        img: item.itemImage,
        category: item.categoryName,
        status: item.inStock ? "In Stock" : "Out of Stock",
      }));

      setMenuItems(formatted || []);
      setLoading(false);
    } catch (err) {
      console.error("❌ Menu Fetch Error:", err);
      setLoading(false);
    }
  };

  // ===================================================================================
  // STEP 1: Fetch staff → STEP 2: Fetch menu
  // ===================================================================================
  useEffect(() => {
    if (token) {
      fetchStaffProfile();
    }
  }, [token]);

  useEffect(() => {
    if (organizationId) {
      fetchMenuItems(organizationId);
    }
  }, [organizationId]);

  // Listen for token updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newToken = localStorage.getItem("jwtToken");
      if (newToken !== token) setToken(newToken);
    }, 500);

    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="chef-menu-catalog chef-container">
      <div className="chef-menu-header">
        <h2>🍽 Menu Catalog</h2>
      </div>

      {loading ? (
        <p>⏳ Loading menu items...</p>
      ) : menuItems.length === 0 ? (
        <p>No menu items found.</p>
      ) : (
        <div className="chef-menu-grid">
          {menuItems.map((item) => (
            <div key={item.id} className="chef-menu-card">
              <div
                className="chef-menu-img"
                style={{ backgroundImage: `url(${item.img})` }}
              ></div>

              <div className="chef-menu-body">
                <div className="chef-menu-title">
                  <span>{item.name}</span>
                  <span className="chef-price">
                    ₹{Number(item.price).toFixed(2)}
                  </span>
                </div>

                <p className="chef-desc">{item.desc}</p>

                <span
                  className={`chef-badge ${
                    item.status === "Out of Stock"
                      ? "chef-badge-error"
                      : "chef-badge-success"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
