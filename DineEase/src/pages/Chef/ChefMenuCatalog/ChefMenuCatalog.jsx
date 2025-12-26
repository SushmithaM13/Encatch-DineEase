import React, { useEffect, useState } from "react";
import "./ChefMenuCatalog.css";

export default function ChefMenuCatalog() {
  const API_PROFILE =
    "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const API_MENU =
    "http://localhost:8082/dine-ease/api/v1/menu/getAll";
  const API_AVAILABILITY =
    "http://localhost:8082/dine-ease/api/v1/menu";

  const categories = [
    "All Items",
    "Starters",
    "Main Course",
    "Vegetarian",
    "Non-Vegetarian",
    "Beverages",
    "Desserts",
  ];

  const token = localStorage.getItem("token");

  const [orgId, setOrgId] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [loading, setLoading] = useState(true);

  const normalize = (str) => str?.toLowerCase().trim();

  /* -------------------- FETCH PROFILE (ORG ID) -------------------- */
  const fetchProfile = async () => {
    try {
      const res = await fetch(API_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data.organizationId) {
        setOrgId(data.organizationId);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  /* -------------------- FETCH MENU ITEMS -------------------- */
  const fetchMenuItems = async (organizationId) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_MENU}?organizationId=${organizationId}&page=0&size=200`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) return;

      const data = await res.json();
      const items = Array.isArray(data.content) ? data.content : data;

      const formatted = items.map((i) => ({
        id: i.id,
        name: i.itemName,
        desc: i.description,
        price: i.price || 0,
        img: i.imageData
          ? `data:image/jpeg;base64,${i.imageData}`
          : "",
        category: i.categoryName,
        isVeg: i.itemTypeName?.toLowerCase() === "veg",
        inStock: i.isAvailable,
      }));

      setMenuItems(formatted);
    } catch (error) {
      console.error("Menu fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- TOGGLE AVAILABILITY -------------------- */
  const toggleStock = async (itemId) => {
    const currentItem = menuItems.find((i) => i.id === itemId);
    if (!currentItem) return;

    try {
      const res = await fetch(
        `${API_AVAILABILITY}/${itemId}/availability`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isAvailable: !currentItem.inStock,
            reason: !currentItem.inStock
              ? "Item back in stock"
              : "Item temporarily unavailable",
          }),
        }
      );

      if (!res.ok) {
        console.error(await res.text());
        return;
      }

      setMenuItems((prev) =>
        prev.map((m) =>
          m.id === itemId
            ? { ...m, inStock: !m.inStock }
            : m
        )
      );
    } catch (error) {
      console.error("Availability update error:", error);
    }
  };

  /* -------------------- FILTER DERIVED STATE -------------------- */
  useEffect(() => {
    let result = menuItems;

    if (activeCategory === "Vegetarian") {
      result = menuItems.filter((i) => i.isVeg);
    } else if (activeCategory === "Non-Vegetarian") {
      result = menuItems.filter((i) => !i.isVeg);
    } else if (activeCategory !== "All Items") {
      result = menuItems.filter(
        (i) => normalize(i.category) === normalize(activeCategory)
      );
    }

    setFilteredItems(result);
  }, [menuItems, activeCategory]);

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  useEffect(() => {
    if (orgId) fetchMenuItems(orgId);
  }, [orgId]);

  /* -------------------- UI -------------------- */
  return (
    <div className="chef-menu-catalog chef-container">
      <h2>🍽 Menu Catalog</h2>

      <div className="chef-category-filter">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`chef-category-btn ${
              activeCategory === cat ? "active" : ""
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : filteredItems.length === 0 ? (
        <p>No Items Found.</p>
      ) : (
        <div className="chef-menu-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="chef-menu-card">
              <div
                className="chef-menu-img"
                style={{ backgroundImage: `url(${item.img})` }}
              />

              <div className="chef-menu-body">
                <div className="chef-menu-title">
                  <span>{item.name}</span>
                  <span className="chef-price">₹{item.price}</span>
                </div>

                <p className="chef-desc">{item.desc}</p>

                <button
                  className={`chef-badge ${
                    item.inStock
                      ? "chef-badge-success"
                      : "chef-badge-error"
                  }`}
                  onClick={() => toggleStock(item.id)}
                >
                  {item.inStock ? "✔ In Stock" : "✘ Out of Stock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
