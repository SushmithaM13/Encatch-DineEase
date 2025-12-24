// @ts-nocheck
import { useState, useEffect } from "react";
import { Sofa, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./WaiterTables.css";

import {
  getWaiterProfile,
  getAssignedTables,
  updateTableStatus,
  reserveTable,
} from "../api/WaiterTableApi";

export default function WaiterTableReservation() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [filterStatus, setFilterStatus] = useState("New");
  const [waiterEmail, setWaiterEmail] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  

  // Fetch waiter profile
  useEffect(() => {
    const token =
      localStorage.getItem("waiterToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("staffToken");

    if (!token) return;

    async function fetchProfile() {
      try {
        const data = await getWaiterProfile(token);
        setWaiterEmail(data.email);
        setOrganizationId(data.organizationId);
      } catch (err) {
        console.error("Profile load error:", err);
      }
    }

    fetchProfile();
  }, []);

  // Fetch assigned tables
  useEffect(() => {
    if (!waiterEmail) return;

    const token =
      localStorage.getItem("waiterToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("staffToken");

    async function loadTables() {
      try {
        const data = await getAssignedTables(waiterEmail, token);
        setTables(data || []);
      } catch (err) {
        console.error("Assigned tables error:", err);
      }
    }

    loadTables();
  }, [waiterEmail]);

  // Status update function
  const performStatusUpdate = async (tableNumber, newStatus) => {
    const token =
      localStorage.getItem("waiterToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("staffToken");

    try {
      if (newStatus === "OCCUPIED") {
        const result = await reserveTable(organizationId, tableNumber, token);

        setTables((prev) =>
          prev.map((t) =>
            t.tableNumber === tableNumber
              ? {
                  ...t,
                  tableStatus: "OCCUPIED",
                  sessionId: result.sessionId,
                  reservedTableSource: "WAITER",
                }
              : t
          )
        );

        return "Table marked as Occupied successfully!";
      }

      await updateTableStatus(tableNumber, newStatus, organizationId, token);

      setTables((prev) =>
        prev.map((t) =>
          t.tableNumber === tableNumber ? { ...t, tableStatus: newStatus } : t
        )
      );

      if (newStatus === "AVAILABLE") return "Table is now Available!";
      if (newStatus === "CLEANING") return "Table marked for Cleaning!";
      return "Status updated!";
    } catch (err) {
      console.error("Update status error:", err);
      return "Something went wrong!";
    }
  };

  const handleConfirmAction = async () => {
    setShowConfirm(false);
    const msg = await performStatusUpdate(selectedTable, pendingAction);
    setSuccessMessage(msg);
    setMessageType("success");
    setShowSuccess(true);
  };

  // Filter tables
  const filteredTables = tables.filter((table) => {
    if (filterStatus === "New") return true;
    return table.tableStatus?.toUpperCase() === filterStatus.toUpperCase();
  });

  return (
    <div className="waiter-table-container">
      <div className="waiter-table-header">
        <h2>
          <Sofa size={22} /> My Tables
        </h2>

        <div className="waiter-table-filter">
          <select
            className="waiter-table-filter-btn"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="New">All</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="RESERVED">Reserved</option>
            <option value="CLEANING">Cleaning</option>
            <option value="OUT_OF_ORDER">Out of Order</option>
          </select>
          <ChevronDown size={16} />
        </div>
      </div>

      <div className="waiter-table-grid">
        {filteredTables.map((table, i) => (
          <div key={i} className="waiter-table-card" data-status={table.tableStatus}>
            <div className="waiter-table-info">
              <h3>Table {table.tableNumber}</h3>
              <p>Status: {table.tableStatus}</p>
              <p>Capacity: {table.capacity}</p>
              <p>Section: {table.section || "—"}</p>
              <p>Location: {table.locationDescription || "—"}</p>
              <p>Source: {table.reservedTableSource || "None"}</p>

              <div
                className={
                  table.sessionId
                    ? "waiter-table-session-badge session-active"
                    : "waiter-table-session-badge session-none"
                }
              >
                {table.sessionId ? `Session: ${table.sessionId}` : "No Session"}
              </div>
            </div>

            <div className="waiter-table-actions">
              {table.tableStatus === "OCCUPIED" && table.sessionId && (
                <button
                  className="waiter-table-addmenu-btn invisible-btn"
                  onClick={() => {
                    navigate(
                      `/WaiterDashboard/menu?sessionId=${table.sessionId}&tableNumber=${table.tableNumber}&source=${table.reservedTableSource}`
                    );
                  }}
                >
                  Add Menu
                </button>
              )}

              {table.tableStatus === "AVAILABLE" && (
                <button
                  className="waiter-table-confirm-btn invisible-btn"
                  onClick={() => {
                    setSelectedTable(table.tableNumber);
                    setPendingAction("OCCUPIED");
                    setShowConfirm(true);
                  }}
                >
                  Mark Occupied
                </button>
              )}

              <button
                className="waiter-table-create-order-btn invisible-btn"
                onClick={() => {
                  if (table.tableStatus === "OCCUPIED") {
                    setSuccessMessage(
                      "Cannot mark OCCUPIED table as CLEANING directly!"
                    );
                    setMessageType("warning");
                    setShowSuccess(true);
                    return;
                  }
                  setSelectedTable(table.tableNumber);
                  setPendingAction("CLEANING");
                  setShowConfirm(true);
                }}
              >
                Mark Cleaning
              </button>

              <button
                className="waiter-table-paid-btn invisible-btn"
                onClick={() => {
                  setSelectedTable(table.tableNumber);
                  setPendingAction("AVAILABLE");
                  setMessageType("success");
                  setShowConfirm(true);
                }}
              >
                Mark Available
              </button>
            </div>
          </div>
        ))}

        {filteredTables.length === 0 && (
          <p style={{ textAlign: "center", color: "gray" }}>No tables assigned to you.</p>
        )}
      </div>

      {showConfirm && (
        <div className="waiter-table-popup-backdrop">
          <div className="waiter-table-popup-box">
            <h3>Confirm Action</h3>
            <p>
              Are you sure you want to mark table <strong>{selectedTable}</strong> as{" "}
              <strong>{pendingAction}</strong>?
            </p>

            <div className="waiter-table-popup-buttons">
              <button className="waiter-table-popup-cancel" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>

              <button className="waiter-table-popup-confirm" onClick={handleConfirmAction}>
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="waiter-table-popup-backdrop">
          <div className="waiter-table-popup-box">
            <h3
              style={{
                color:
                  messageType === "success"
                    ? "green"
                    : messageType === "warning"
                    ? "orange"
                    : "red",
              }}
            >
              {messageType === "success"
                ? "Success!"
                : messageType === "warning"
                ? "Warning!"
                : "Error!"}
            </h3>
            <p>{successMessage}</p>
            <button className="waiter-table-popup-ok" onClick={() => setShowSuccess(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
// ---------------------------------------------