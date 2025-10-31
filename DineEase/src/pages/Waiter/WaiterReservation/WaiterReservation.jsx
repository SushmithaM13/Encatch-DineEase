import { useState, useEffect } from "react";
import { CalendarDays, X, ChevronDown } from "lucide-react";
import "./WaiterReservation.css";

export default function WaiterTableReservation() {
  const [tables, setTables] = useState([]);
  const [filterStatus, setFilterStatus] = useState("New");
  const waiterEmail = localStorage.getItem("waiterEmail");

  // =========================
  // Load waiter-specific tables
  // =========================
  useEffect(() => {
    const storedTables = JSON.parse(localStorage.getItem("tables") || "[]");
    let assignedTables = storedTables.filter((t) => t.waiterEmail === waiterEmail);

    // Sample tables if none exist
    if (storedTables.length === 0) {
      const sampleTables = [
        { id: 1, tableNumber: "T1", tableStatus: "AVAILABLE", capacity: 4, section: "A", locationDescription: "Near window", waiterEmail },
        { id: 2, tableNumber: "T2", tableStatus: "BOOKED", capacity: 2, section: "B", locationDescription: "Center hall", waiterEmail },
        { id: 3, tableNumber: "T3", tableStatus: "COMPLETED", capacity: 6, section: "C", locationDescription: "Patio", waiterEmail },
      ];
      localStorage.setItem("tables", JSON.stringify(sampleTables));
      assignedTables = sampleTables;
    }

    setTables(assignedTables);
  }, [waiterEmail]);

  // =========================
  // Update table status
  // =========================
  const updateStatus = (id, newStatus) => {
    const updated = tables.map((t) =>
      t.id === id ? { ...t, tableStatus: newStatus } : t
    );
    setTables(updated);

    const allTables = JSON.parse(localStorage.getItem("tables") || "[]");
    const updatedAll = allTables.map((t) =>
      t.id === id ? { ...t, tableStatus: newStatus } : t
    );
    localStorage.setItem("tables", JSON.stringify(updatedAll));
  };

  // =========================
  // Filter tables by status
  // =========================
  const filteredTables = tables.filter((table) => {
    if (filterStatus === "New") return true;
    return table.tableStatus.toUpperCase() === filterStatus.toUpperCase();
  });

  return (
    <div className="waiter-reservation-container">
      {/* Header */}
      <div className="waiter-reservation-header">
        <h2>
          <CalendarDays size={22} /> My Tables
        </h2>

        {/* Filter Dropdown */}
        <div className="waiter-reservation-filter">
          <select
            className="waiter-filter-btn"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="New">All</option>
            <option value="AVAILABLE">Available</option>
            <option value="BOOKED">Booked</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <ChevronDown size={16} />
        </div>
      </div>

      {/* Grid */}
      <div className="waiter-reservation-grid">
        {filteredTables.map((table) => (
          <div key={table.id} className="waiter-reservation-card">
            <div className="waiter-table-info">
              <h3>Table {table.tableNumber}</h3>
              <p>Status: {table.tableStatus}</p>
              <p>Capacity: {table.capacity}</p>
              <p>Section: {table.section || "—"}</p>
              <p>Location: {table.locationDescription || "—"}</p>
            </div>

            <div className="waiter-reservation-actions">
              {table.tableStatus === "BOOKED" && (
                <button
                  className="waiter-confirm-btn"
                  onClick={() => updateStatus(table.id, "AVAILABLE")}
                >
                  Confirm
                </button>
              )}
              {table.tableStatus === "AVAILABLE" && (
                <button
                  className="waiter-create-order-btn"
                  onClick={() => updateStatus(table.id, "BOOKED")}
                >
                  Mark Booked
                </button>
              )}
              {table.tableStatus === "COMPLETED" && (
                <button className="waiter-paid-btn" disabled>
                  Completed
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredTables.length === 0 && (
          <p style={{ textAlign: "center", color: "gray" }}>
            No tables assigned to you.
          </p>
        )}
      </div>
    </div>
  );
}
