import React, { useEffect, useState } from "react";
import "./Inventory.module.css";

export default function Inventory() {
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
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventory Status</h2>
        <button className="btn btn-outline" onClick={handleRequest}>
          ➕ Request Items
        </button>
      </div>

      <div className="table-wrapper">
        <table className="inventory-table">
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
                    className={`badge ${
                      item.status === "Adequate"
                        ? "badge-success"
                        : item.status === "Low"
                        ? "badge-warning"
                        : "badge-error"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleNotify(item.ingredient)}
                  >
                    🔔 Notify
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
