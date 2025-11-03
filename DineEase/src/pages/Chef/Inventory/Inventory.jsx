import React, { useEffect, useState } from "react";
import "./Inventory.module.css";

export default function ChefInventory() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const dummyInventory = [
      {
        ingredient: "Salmon Fillet",
        category: "Seafood",
        stock: "15 kg",
        status: "Adequate",
      },
      {
        ingredient: "Chicken Breast",
        category: "Poultry",
        stock: "8 kg",
        status: "Low",
      },
      {
        ingredient: "Chocolate",
        category: "Bakery",
        stock: "0 kg",
        status: "Out of Stock",
      },
      {
        ingredient: "Fresh Vegetables",
        category: "Produce",
        stock: "25 kg",
        status: "Adequate",
      },
    ];
    setInventory(dummyInventory);
  }, []);

  const handleNotify = (item) => {
    alert(`Notification sent for ${item}`);
  };

  const handleRequest = () => {
    alert("Request for new items sent to the admin!");
  };

  return (
    <div className="chef-inventory-container">
      <div className="chef-inventory-header">
        <h2>Inventory Status</h2>
        <button className="chef-add-btn" onClick={handleRequest}>
          ➕ Request Items
        </button>
      </div>

      <div className="chef-table-wrapper">
        <table className="chef-inventory-table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, i) => (
              <tr key={i}>
                <td>{item.ingredient}</td>
                <td>{item.category}</td>
                <td>{item.stock}</td>
                <td>
                  <span
                    className={`chef-status ${
                      item.status === "Adequate"
                        ? "chef-status-adequate"
                        : item.status === "Low"
                        ? "chef-status-low"
                        : "chef-status-out"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>
                  <button
                    className="chef-action-btn chef-notify"
                    onClick={() => handleNotify(item.ingredient)}
                  >
                    🔔
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
