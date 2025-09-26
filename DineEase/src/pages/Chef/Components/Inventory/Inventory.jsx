import React, { useEffect, useState } from "react";
import { getInventory } from "../../Api/inventory";
import "./Inventory.css";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    getInventory().then(setInventory);
  }, []);

  return (
    <div className="inventory">
      <h2>Inventory Status</h2>
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
            {inventory.map((item, idx) => (
              <tr key={idx}>
                <td>{item.ingredient}</td>
                <td>{item.category}</td>
                <td>{item.stock}</td>
                <td>
                  <span
                    className={`status-badge ${item.status
                      .toLowerCase()
                      .replace(/\s/g, "-")}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>
                  <button className="notify-btn">🔔 Notify</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="request-btn">+ Request Items</button>
    </div>
  );
}
