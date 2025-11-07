import React, { useState } from "react";
import "./ChefMenuCatalog.css";

export default function ChefMenuCatalog() {
  const [menuItems, setMenuItems] = useState([
    {
      name: "Grilled Salmon",
      desc: "Fresh Atlantic salmon with herbs and lemon butter sauce",
      price: 24.99,
      category: "Main Course",
      status: "In Stock",
      img: "https://via.placeholder.com/300x200/FF8F00/FFFFFF?text=Grilled+Salmon",
    },
    {
      name: "Vegetarian Pasta",
      desc: "Penne pasta with seasonal vegetables in creamy sauce",
      price: 16.99,
      category: "Vegetarian",
      status: "In Stock",
      img: "https://via.placeholder.com/300x200/2E7D32/FFFFFF?text=Veg+Pasta",
    },
    {
      name: "Chocolate Cake",
      desc: "Rich chocolate cake with ganache frosting",
      price: 8.99,
      category: "Desserts",
      status: "Out of Stock",
      img: "https://via.placeholder.com/300x200/EF5350/FFFFFF?text=Chocolate+Cake",
    },
  ]);

  const [activeFilter, setActiveFilter] = useState("All Items");

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

  const toggleStock = (name) => {
    const updated = menuItems.map((item) =>
      item.name === name
        ? {
            ...item,
            status: item.status === "Out of Stock" ? "In Stock" : "Out of Stock",
          }
        : item
    );
    setMenuItems(updated);
  };

  const handleReportOut = () => {
    const outItems = menuItems.filter((i) => i.status === "Out of Stock");
    alert(
      outItems.length
        ? `Out of Stock Items:\n${outItems.map((i) => i.name).join("\n")}`
        : "No items are out of stock!"
    );
  };

  return (
    <div className="menu-catalog container">
      <div className="menu-header">
        <h2>Menu Catalog</h2>
        <button className="btn btn-outline" onClick={handleReportOut}>
          ⚠ Report Out of Stock
        </button>
      </div>

      <div className="filter-chips">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`chip ${activeFilter === cat ? "active" : ""}`}
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
                item.status === "Out of Stock" ? "out-of-stock" : ""
              }`}
            >
              <div
                className="menu-img"
                style={{ backgroundImage: `url(${item.img})` }}
              ></div>
              <div className="menu-body">
                <div className="menu-title">
                  <span>{item.name}</span>
                  <span className="price">${item.price.toFixed(2)}</span>
                </div>
                <p className="desc">{item.desc}</p>
                <div className="menu-footer">
                  <span
                    className={`badge ${
                      item.status === "Out of Stock" ? "badge-error" : "badge-success"
                    }`}
                  >
                    {item.status}
                  </span>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => toggleStock(item.name)}
                  >
                    {item.status === "Out of Stock" ? "Mark In Stock" : "Mark Out"}
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
