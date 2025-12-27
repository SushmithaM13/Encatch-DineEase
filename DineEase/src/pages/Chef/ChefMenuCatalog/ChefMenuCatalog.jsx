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

  // 🔹 POPUP STATE
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [outOfStockReason, setOutOfStockReason] = useState("");

  const normalize = (str) => str?.toLowerCase().trim();

  /* -------------------- FETCH PROFILE -------------------- */
  const fetchProfile = async () => {
    try {
      const res = await fetch(API_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.organizationId) setOrgId(data.organizationId);
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  /* -------------------- FETCH MENU -------------------- */
  const fetchMenuItems = async (organizationId) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_MENU}?organizationId=${organizationId}&page=0&size=200`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;

      const data = await res.json();
      const items = Array.isArray(data.content) ? data.content : data;

      setMenuItems(
        items.map((i) => ({
          id: i.id,
          name: i.itemName,
          desc: i.description,
          img: i.imageData
            ? `data:image/jpeg;base64,${i.imageData}`
            : "",
          category: i.categoryName,
          isVeg: i.itemTypeName?.toLowerCase() === "veg",
          inStock: i.isAvailable,
        }))
      );
    } catch (error) {
      console.error("Menu fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- OPEN POPUP -------------------- */
  const openOutOfStockPopup = (item) => {
    if (!item.inStock) return;
    setSelectedItem(item);
    setOutOfStockReason("");
    setShowPopup(true);
  };

  /* -------------------- CONFIRM OUT OF STOCK -------------------- */
  const confirmOutOfStock = async () => {
    if (!outOfStockReason.trim()) {
      alert("Please enter a reason.");
      return;
    }

    try {
      const res = await fetch(
        `${API_AVAILABILITY}/${selectedItem.id}/availability`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isAvailable: false,
            reason: outOfStockReason,
          }),
        }
      );

      if (!res.ok) {
        console.error(await res.text());
        return;
      }

      setMenuItems((prev) =>
        prev.map((m) =>
          m.id === selectedItem.id ? { ...m, inStock: false } : m
        )
      );

      closePopup();
    } catch (error) {
      console.error("Out of stock update error:", error);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedItem(null);
    setOutOfStockReason("");
  };

  /* -------------------- FILTER -------------------- */
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

  /* -------------------- LOAD -------------------- */
  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  useEffect(() => {
    if (!orgId) return;
    fetchMenuItems(orgId);

    const interval = setInterval(() => {
      fetchMenuItems(orgId);
    }, 10000);

    return () => clearInterval(interval);
  }, [orgId]);

  /* -------------------- UI -------------------- */
  return (
    <div className="Chef-MenuCatalog-container">
      <h2 className="Chef-MenuCatalog-title">🍽 Menu Catalog</h2>

      <div className="Chef-MenuCatalog-category-filter">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`Chef-MenuCatalog-category-btn ${
              activeCategory === cat ? "Chef-MenuCatalog-active" : ""
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="Chef-MenuCatalog-menu-grid">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`Chef-MenuCatalog-menu-card ${
              !item.inStock ? "Chef-MenuCatalog-out-of-stock" : ""
            }`}
          >
            <div
  className="Chef-MenuCatalog-menu-img"
  style={{
    backgroundImage: item.img ? `url(${item.img})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: !item.img ? "#e5e3dc" : "transparent",
  }}
>
  {!item.inStock && (
    <div className="Chef-MenuCatalog-stock-overlay">
      OUT OF STOCK
    </div>
  )}

  {item.isVeg ? (
    <span className="Chef-MenuCatalog-veg-badge">🌿 Veg</span>
  ) : (
    <span className="Chef-MenuCatalog-nonveg-badge">🍖 Non-Veg</span>
  )}
</div>


            <div className="Chef-MenuCatalog-menu-body">
              <span className="Chef-MenuCatalog-item-name">{item.name}</span>
              <p className="Chef-MenuCatalog-desc">{item.desc}</p>

              <button
                className={`Chef-MenuCatalog-badge ${
                  item.inStock
                    ? "Chef-MenuCatalog-badge-success"
                    : "Chef-MenuCatalog-badge-error"
                }`}
                disabled={!item.inStock}
                onClick={() => openOutOfStockPopup(item)}
              >
                {item.inStock ? "✔ In Stock" : "✘ Out of Stock"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* -------------------- POPUP -------------------- */}
      {showPopup && (
        <div className="Chef-MenuCatalog-popup-overlay">
          <div className="Chef-MenuCatalog-popup">
            <h3>Mark "{selectedItem?.name}" Out of Stock</h3>

            <textarea
              placeholder="Enter reason (required)"
              value={outOfStockReason}
              onChange={(e) => setOutOfStockReason(e.target.value)}
            />

            <div className="Chef-MenuCatalog-popup-actions">
              <button onClick={closePopup} className="cancel">
                Cancel
              </button>
              <button onClick={confirmOutOfStock} className="confirm">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
