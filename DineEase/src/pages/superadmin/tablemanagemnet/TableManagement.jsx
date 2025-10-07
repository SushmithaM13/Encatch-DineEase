import React, { useState, useEffect } from "react";
import "./TableManagement.css";

export default function TableManagement() {
  const [tables, setTables] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      tableNumber: `T-${i + 1}`,
      capacity: (i % 5 + 1) * 2, // 2,4,6,8,10 repeating
      status: "AVAILABLE",
      waiter: "",
    }))
  );

  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [waiterName, setWaiterName] = useState("");

  // Load saved tables from localStorage on mount
  useEffect(() => {
    const savedTables = localStorage.getItem("restaurantTables");
    if (savedTables) setTables(JSON.parse(savedTables));
  }, []);

  // Save tables whenever they change
  useEffect(() => {
    localStorage.setItem("restaurantTables", JSON.stringify(tables));
  }, [tables]);

  const handleAssign = (table) => {
    setSelectedTable(table);
    setShowAssignPopup(true);
  };

  const handleConfirmAssign = () => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTable.id
          ? { ...t, status: "ASSIGNED", waiter: waiterName }
          : t
      )
    );
    setWaiterName("");
    setShowAssignPopup(false);
    setSelectedTable(null);
  };

  const handleToggleStatus = (id) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "AVAILABLE" ? "NOT AVAILABLE" : "AVAILABLE",
              waiter: t.status === "AVAILABLE" ? "" : t.waiter,
            }
          : t
      )
    );
  };

  return (
    <div className="table-management-container">
      <h1 className="page-heading">Restaurant Table Management</h1>

      <div className="table-grid">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`table-card ${
              table.status === "AVAILABLE"
                ? "available"
                : table.status === "ASSIGNED"
                ? "assigned"
                : "not-available"
            }`}
            onClick={() => handleAssign(table)}
          >
            <h3>{table.tableNumber}</h3>
            <p>Capacity: {table.capacity}</p>
            <p>Status: {table.status}</p>
            {table.waiter && <p>Waiter: {table.waiter}</p>}
            <button
              className="toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(table.id);
              }}
            >
              Toggle Status
            </button>
          </div>
        ))}
      </div>

      {showAssignPopup && (
        <div className="popup-overlay">
          <div className="popup-content animate-fade-in">
            <h3>
              Assign {selectedTable.tableNumber} (Capacity:{" "}
              {selectedTable.capacity})
            </h3>
            <input
              type="text"
              placeholder="Enter Waiter Name"
              value={waiterName}
              onChange={(e) => setWaiterName(e.target.value)}
            />
            <div className="popup-actions">
              <button className="assign-btn" onClick={handleConfirmAssign}>
                Assign
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowAssignPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
