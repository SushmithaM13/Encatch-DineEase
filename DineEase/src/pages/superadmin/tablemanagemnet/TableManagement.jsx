import React, { useState } from "react";
import "./TableManagement.css";

export default function TableManagement() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [tableRecords, setTableRecords] = useState([]);
  const [tableForm, setTableForm] = useState({
    tableNumber: "",
    tableStatus: true,
    capacity: 2,
    section: "",
    locationDescription: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTableForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTableStatus = () => {
    setTableForm((prev) => ({ ...prev, tableStatus: !prev.tableStatus }));
  };

  const addNewTable = () => {
    if (!tableForm.tableNumber) return alert("Please enter table number");
    setTableRecords((prev) => [...prev, tableForm]);
    setIsFormVisible(false);
    setIsPopupVisible(true);

    setTableForm({
      tableNumber: "",
      tableStatus: true,
      capacity: 2,
      section: "",
      locationDescription: "",
    });

    setTimeout(() => setIsPopupVisible(false), 2500);
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

          <button className="submit-btn" onClick={addNewTable}>
            Add Table
          </button>
        </div>
      )}

      {isPopupVisible && (
        <div className="popup-message fade-in">✅ Table added successfully!</div>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
