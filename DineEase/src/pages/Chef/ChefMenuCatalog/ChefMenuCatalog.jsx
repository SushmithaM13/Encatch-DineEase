import React, { useState, useEffect } from "react";
import "./ChefMenuCatalog.css";

export default function ChefMenuCatalog() {
  const TOKEN = localStorage.getItem("chefToken");

  // FIXED API URL
  const API_URL_MENU =
    "http://localhost:8082/dine-ease/api/v1/menu/getAll?organizationId=5a812c7d-c96f-4929-823f-86b4a62be304";

  const [menuItems, setMenuItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Items");
  const [loading, setLoading] = useState(true);

  const categories = [
    "All Items",
    "Starters",
    "Main Course",
    "Vegetarian",
    "Non-Vegetarian",
    "Beverages",
    "Desserts",
  ];

  // --------------------------------------------------
  // 1️⃣ DIRECTLY FETCH MENU FROM FIXED API
  // --------------------------------------------------
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);

        const res = await fetch(API_URL_MENU, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });

        const data = await res.json();
        console.log("MENU API RESPONSE:", data);

        const items = Array.isArray(data) ? data : [];

        const mapped = items.map((item) => ({
          id: item.id,
          name: item.itemName,
          desc: item.description || "No description available",
          price:
            item.variants?.length > 0
              ? Math.min(...item.variants.map((v) => Number(v.price)))
              : 0,
          category: item.categoryName || "Uncategorized",

          img: item.imageData
            ? `data:image/jpeg;base64,${item.imageData}`
            : item.imageUrl
            ? item.imageUrl.replace(
                "C:\\dine-ease-backend\\dine-ease\\uploads\\",
                "http://localhost:8082/dine-ease/uploads/"
              )
            : "https://dummyimage.com/300x200/000/fff&text=No+Image",

          status: item.isAvailable ? "In Stock" : "Out of Stock",
        }));

        setMenuItems(mapped);
      } catch (err) {
        console.error("Menu error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // --------------------------------------------------
  // 2️⃣ FILTER MENU ITEMS
  // --------------------------------------------------
  const filteredItems =
    activeFilter === "All Items"
      ? menuItems
      : menuItems.filter((item) => item.category === activeFilter);

  // --------------------------------------------------
  // 3️⃣ TOGGLE STOCK (UI ONLY)
  // --------------------------------------------------
  const toggleStock = (name) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.name === name
          ? {
              ...item,
              status:
                item.status === "Out of Stock" ? "In Stock" : "Out of Stock",
            }
          : item
      )
    );
  };

  // --------------------------------------------------
  // 4️⃣ REPORT OUT OF STOCK
  // --------------------------------------------------
  const handleReportOut = () => {
    const outItems = menuItems.filter((i) => i.status === "Out of Stock");
    alert(
      outItems.length
        ? `Out of Stock Items:\n${outItems.map((i) => i.name).join("\n")}`
        : "No items are out of stock!"
    );
  };

  if (loading) return <p>Loading Menu...</p>;

  return (
    <div className="chef-menu-catalog chef-container">
      <div className="chef-menu-header">
        <h2>Menu Catalog</h2>
        <button className="chef-btn chef-btn-outline" onClick={handleReportOut}>
          ⚠ Report Out of Stock
        </button>
      </div>

      <div className="chef-filter-chips">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`chef-chip ${activeFilter === cat ? "chef-active" : ""}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="chef-menu-grid">
        {filteredItems.length === 0 ? (
          <p className="chef-no-items">No items in this category.</p>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`chef-menu-card ${
                item.status === "Out of Stock" ? "chef-out-of-stock" : ""
              }`}
            >
              <div
                className="chef-menu-img"
                style={{ backgroundImage: `url(${item.img})` }}
              ></div>

              <div className="chef-menu-body">
                <div className="chef-menu-title">
                  <span>{item.name}</span>
                  <span className="chef-price">${item.price}</span>
                </div>

                <p className="chef-desc">{item.desc}</p>

                <div className="chef-menu-footer">
                  <span
                    className={`chef-badge ${
                      item.status === "Out of Stock"
                        ? "chef-badge-error"
                        : "chef-badge-success"
                    }`}
                  >
                    {item.status}
                  </span>

                  <button
                    className="chef-btn chef-btn-sm chef-btn-outline"
                    onClick={() => toggleStock(item.name)}
                  >
                    {item.status === "Out of Stock"
                      ? "Mark In Stock"
                      : "Mark Out"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
