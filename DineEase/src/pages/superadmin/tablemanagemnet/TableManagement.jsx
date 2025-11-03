import React, { useState } from "react";
import "./TableManagement.css";

export default function TableManagement() {
  const API_BASE = "http://localhost:8082/dine-ease/api/v1"; // 🔹 Change if needed

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [tableRecords, setTableRecords] = useState([]);
  const [generatedQR, setGeneratedQR] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  const [tableForm, setTableForm] = useState({
    tableNumber: "",
    tableStatus: true,
    capacity: 2,
    section: "",
    locationDescription: "",
    organizationId: "",
  });

  // Handle input updates
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTableForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTableStatus = () => {
    setTableForm((prev) => ({ ...prev, tableStatus: !prev.tableStatus }));
  };

  // 🔹 STEP 1: Add Table API
  const addNewTable = async () => {
    if (!tableForm.tableNumber)
      return alert("Please enter table number");

    try {
      const response = await fetch(`${API_BASE}/tables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tableForm),
      });

      if (!response.ok) throw new Error("Failed to add table");
      const data = await response.json();

      setTableRecords((prev) => [...prev, data]);
      setSelectedTable(data);
      setIsFormVisible(false);
      setIsPopupVisible(true);

      setTimeout(() => setIsPopupVisible(false), 2000);

      setTableForm({
        tableNumber: "",
        tableStatus: true,
        capacity: 2,
        section: "",
        locationDescription: "",
        organizationId: "",
      });
    } catch (error) {
      alert(error.message);
    }
  };

  // 🔹 STEP 2: Generate QR Code API
  const generateQRCode = async () => {
    if (!selectedTable?.tableNumber || !selectedTable?.organizationId)
      return alert("Please ensure Table Number & Organization ID are filled.");

    try {
      const response = await fetch(`${API_BASE}/tables/generateQR`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: selectedTable.tableNumber,
          organizationId: selectedTable.organizationId,
        }),
      });

      if (!response.ok) throw new Error("QR generation failed");
      const blob = await response.blob();
      const qrUrl = URL.createObjectURL(blob);
      setGeneratedQR(qrUrl);
      alert("QR Code generated successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  // 🔹 STEP 3: Assign Table to Waiter API
  const assignTableToWaiter = async (waiterId) => {
    if (!selectedTable?.tableNumber) return alert("Please add a table first!");

    try {
      const response = await fetch(`${API_BASE}/tables/assignWaiter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: selectedTable.tableNumber,
          waiterId,
        }),
      });

      if (!response.ok) throw new Error("Failed to assign waiter");
      alert("✅ Table assigned to waiter successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="assign">
      <h1 className="assign-heading">Restaurant Table Assignment</h1>

      <button
        className="assign-btn"
        onClick={() => setIsFormVisible((prev) => !prev)}
      >
        {isFormVisible ? "Close Form" : "Add Table"}
      </button>

      {isFormVisible && (
        <div className="assign-form fade-in">
          <label>
            Table Number:
            <input
              type="text"
              name="tableNumber"
              value={tableForm.tableNumber}
              onChange={handleInputChange}
              placeholder="Enter Table Number"
            />
          </label>

          <label>
            Table Status:
            <div className="status-toggle">
              <input
                type="checkbox"
                id="toggleStatus"
                checked={tableForm.tableStatus}
                onChange={toggleTableStatus}
              />
              <label htmlFor="toggleStatus" className="status-label">
                {tableForm.tableStatus ? "AVAILABLE" : "NOT AVAILABLE"}
              </label>
            </div>
          </label>

          <label>
            Capacity:
            <select
              name="capacity"
              value={tableForm.capacity}
              onChange={handleInputChange}
            >
              {[2, 4, 6, 8, 10].map((num) => (
                <option key={num} value={num}>
                  {num} Members
                </option>
              ))}
            </select>
          </label>

          <label>
            Section:
            <input
              type="text"
              name="section"
              value={tableForm.section}
              onChange={handleInputChange}
              placeholder="Enter Section Name"
            />
          </label>

          <label>
            Location Description:
            <input
              type="text"
              name="locationDescription"
              value={tableForm.locationDescription}
              onChange={handleInputChange}
              placeholder="Enter Location Description"
            />
          </label>

          <label>
            Organization ID:
            <input
              type="text"
              name="organizationId"
              value={tableForm.organizationId}
              onChange={handleInputChange}
              placeholder="Enter Organization ID"
            />
          </label>

          <button className="submit-btn" onClick={addNewTable}>
            Add Table
          </button>
        </div>
      )}

      {isPopupVisible && (
        <div className="popup-message fade-in">✅ Table added successfully!</div>
      )}

      {selectedTable && (
        <div className="qr-section slide-up">
          <h3>QR Code Generation</h3>
          <button className="qr-btn" onClick={generateQRCode}>
            Generate QR
          </button>
          {generatedQR && (
            <div className="qr-display">
              <img src={generatedQR} alt="Table QR" />
              <button
                className="assign-waiter-btn"
                onClick={() => assignTableToWaiter("WAIT123")}
              >
                Assign Table to Waiter
              </button>
            </div>
          )}
        </div>
      )}

      {tableRecords.length > 0 && (
        <div className="records-container slide-up">
          <h2 className="records-heading">All Tables</h2>
          <table className="records-table">
            <thead>
              <tr>
                <th>Table No</th>
                <th>Status</th>
                <th>Capacity</th>
                <th>Section</th>
                <th>Location</th>
                <th>Org ID</th>
              </tr>
            </thead>
            <tbody>
              {tableRecords.map((table, index) => (
                <tr
                  key={index}
                  className={
                    table.tableStatus ? "status-available" : "status-unavailable"
                  }
                >
                  <td>{table.tableNumber}</td>
                  <td>{table.tableStatus ? "AVAILABLE" : "NOT AVAILABLE"}</td>
                  <td>{table.capacity}</td>
                  <td>{table.section}</td>
                  <td>{table.locationDescription}</td>
                  <td>{table.organizationId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
