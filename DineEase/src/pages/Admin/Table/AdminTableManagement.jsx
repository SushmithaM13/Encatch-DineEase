import { useState, useEffect } from "react";
import {
  Sofa,
  Plus,
  Download,
  X,
  User,
} from "lucide-react";
import "./tables.css";

export default function AdminTableManagement() {
  const [tables, setTables] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const [newTable, setNewTable] = useState({
    organizationId: "",
    tableNumber: "",
    tableStatus: "AVAILABLE",
    capacity: 1,
    section: "",
    locationDescription: "",
    waiterEmail: "",
    qrCodeUrl: "",
  });

  // Load tables from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tables") || "[]");
    setTables(stored);
  }, []);

  // Save to localStorage helper
  const saveTables = (data) => {
    setTables(data);
    localStorage.setItem("tables", JSON.stringify(data));
  };

  // Add a new table
  const handleAddTable = () => {
    const { organizationId, tableNumber } = newTable;
    if (!organizationId.trim() || !tableNumber.trim()) {
      alert("Please enter Organization ID and Table Number");
      return;
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Org-${organizationId}-Table-${encodeURIComponent(
      tableNumber
    )}`;

    const tableData = {
      id: Date.now(),
      ...newTable,
      qrCodeUrl: qrUrl,
    };

    const updated = [...tables, tableData];
    saveTables(updated);

    // Reset
    setNewTable({
      organizationId: "",
      tableNumber: "",
      tableStatus: "AVAILABLE",
      capacity: 1,
      section: "",
      locationDescription: "",
      waiterEmail: "",
      qrCodeUrl: "",
    });
    setShowAddPopup(false);
  };

  const handleDeleteTable = (id) => {
    const updated = tables.filter((t) => t.id !== id);
    saveTables(updated);
  };

  const handleDownloadQr = async (url, tableNumber) => {
  if (!url) {
    alert("QR not generated for this table yet.");
    return;
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${tableNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download QR code.");
  }
};


  return (
    <div className="admin-tables-page">
      <h2 className="admin-page-title">
        <Sofa size={22} /> Table Management
      </h2>

      <div className="admin-add-table-section admin-right-align">
        <button onClick={() => setShowAddPopup(true)}>
          <Plus size={16} /> Add Table
        </button>
      </div>

      <div className="admin-stats">
        <p>Total: {tables.length}</p>
        <p>Available: {tables.filter((t) => t.tableStatus === "AVAILABLE").length}</p>
        <p>Booked: {tables.filter((t) => t.tableStatus === "BOOKED").length}</p>
        <p>Cleaning: {tables.filter((t) => t.tableStatus === "CLEANING").length}</p>
      </div>

      <div className="admin-tables-grid">
        {tables.map((table) => (
          <div key={table.id} className={`admin-table-card ${table.tableStatus.toLowerCase()}`}>
            <div className="admin-table-card-header">
              <h3>{table.tableNumber}</h3>
              <button
                className="admin-dots-btn"
                onClick={() =>
                  setDropdownOpen(dropdownOpen === table.id ? null : table.id)
                }
              >
                ⋮
              </button>
              {dropdownOpen === table.id && (
                <div className="admin-dropdown-menu">
                  <button onClick={() => handleDeleteTable(table.id)}>Delete</button>
                  <button onClick={() => handleDownloadQr(table.qrCodeUrl, table.tableNumber)}>
                    <Download size={14} /> Download QR
                  </button>
                </div>
              )}
            </div>

            <p>Status: {table.tableStatus}</p>
            <p>Capacity: {table.capacity}</p>
            <p>Section: {table.section || "—"}</p>
            <p>Location: {table.locationDescription || "—"}</p>
            <p>
              Waiter:{" "}
              {table.waiterEmail ? (
                <>
                  <User size={14} /> {table.waiterEmail}
                </>
              ) : (
                "—"
              )}
            </p>

            {table.qrCodeUrl && (
              <div className="qr-section">
                <img src={table.qrCodeUrl} alt="QR Code" className="qr-image" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Table Popup */}
      {showAddPopup && (
        <div className="admin-popup-overlay">
          <div className="admin-popup">
            <button className="admin-popup-close" onClick={() => setShowAddPopup(false)}>
              <X size={18} />
            </button>
            <h3>Add New Table</h3>

            <label>
              Organization ID:
              <input
                type="text"
                value={newTable.organizationId}
                onChange={(e) =>
                  setNewTable({ ...newTable, organizationId: e.target.value })
                }
              />
            </label>

            <label>
              Table Number:
              <input
                type="text"
                value={newTable.tableNumber}
                onChange={(e) =>
                  setNewTable({ ...newTable, tableNumber: e.target.value })
                }
              />
            </label>

            <label>
              Table Status:
              <select
                value={newTable.tableStatus}
                onChange={(e) =>
                  setNewTable({ ...newTable, tableStatus: e.target.value })
                }
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BOOKED">BOOKED</option>
                <option value="CLEANING">CLEANING</option>
              </select>
            </label>

            <label>
              Capacity:
              <input
                type="number"
                min="1"
                value={newTable.capacity}
                onChange={(e) =>
                  setNewTable({ ...newTable, capacity: Number(e.target.value) })
                }
              />
            </label>

            <label>
              Section:
              <input
                type="text"
                value={newTable.section}
                onChange={(e) =>
                  setNewTable({ ...newTable, section: e.target.value })
                }
              />
            </label>

            <label>
              Location Description:
              <textarea
                value={newTable.locationDescription}
                onChange={(e) =>
                  setNewTable({ ...newTable, locationDescription: e.target.value })
                }
              />
            </label>

            <label>
              Waiter Email:
              <input
                type="email"
                value={newTable.waiterEmail}
                onChange={(e) =>
                  setNewTable({ ...newTable, waiterEmail: e.target.value })
                }
              />
            </label>

            <div className="admin-popup-actions">
              <button onClick={handleAddTable}>Save & Generate QR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
