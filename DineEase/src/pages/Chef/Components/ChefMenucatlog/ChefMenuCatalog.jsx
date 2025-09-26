import React, { useEffect, useState } from "react";
import { getMenuItems } from "../../api/menu";
import "./ChefMenuCatalog.css";

export default function ChefMenuCatalog() {
  const [menuItems, setMenuItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Items");

  useEffect(() => {
    getMenuItems().then(setMenuItems);
  }, []);

  const categories = [
    "All Items",
    "Starters",
    "Main Course",
    "Vegetarian",
    "Non-Vegetarian",
    "Beverages",
    "Desserts",
  ];

  const filteredItems =
    activeFilter === "All Items"
      ? menuItems
      : menuItems.filter((item) => item.category === activeFilter);

  // toggle stock status for item by index
  const toggleStock = (name) => {
    const updated = menuItems.map((item) =>
      item.name === name
        ? {
            ...item,
            status:
              item.status === "Out of Stock" ? "In Stock" : "Out of Stock",
          }
        : item
    );
    setMenuItems(updated);
  };

  // Report out of stock
  const handleReportOut = () => {
    const outItems = menuItems.filter((item) => item.status === "Out of Stock");
    alert(
      outItems.length > 0
        ? `Out of Stock Items:\n${outItems.map((i) => i.name).join("\n")}`
        : "No items are out of stock!"
    );
  };

  return (
    <div className="menu-catalog">
      <h2>Menu Catalog</h2>

      <div className="filter-chips">
        {categories.map((cat) => (
          <button
            key={cat}
            className={activeFilter === cat ? "chip active" : "chip"}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {filteredItems.length === 0 ? (
          <p className="no-items">No items in this category.</p>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.name}
              className={`menu-card ${
                item.status === "Out of Stock" ? "out" : ""
              }`}
            >
              <div
                className="image-placeholder"
                style={{
                  backgroundImage: `url(${item.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
              <div className="menu-body">
                <h3>{item.name}</h3>
                <p className="desc">{item.desc}</p>
                <div className="price-stock">
                  <span className="price">${item.price.toFixed(2)}</span>
                  <span
                    className={`stock-badge ${
                      item.status === "Out of Stock" ? "out" : "in"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <button
                  className="toggle-stock-btn"
                  onClick={() => toggleStock(item.name)}
                >
                  {item.status === "Out of Stock"
                    ? "Mark In Stock"
                    : "Mark Out of Stock"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="report-out" onClick={handleReportOut}>
        ⚠ Report Out of Stock
      </button>
    </div>
  );
}
