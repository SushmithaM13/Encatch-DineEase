import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Brush,
  Plus,
  Sofa,
  MoreVertical,
  X,
  User,
} from "lucide-react";
import "./tables.css";

export default function AdminTableManagement() {
  const [tables, setTables] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showWaiterPopup, setShowWaiterPopup] = useState(false);
  const [editTableId, setEditTableId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [currentTableId, setCurrentTableId] = useState(null);

  const [newTable, setNewTable] = useState({
    tableNumber: "",
    tableStatus: "AVAILABLE",
    capacity: 1,
    section: "",
    locationDescription: "",
  });

  const [waiter, setWaiter] = useState({
    waiterName: "",
    waiterEmail: "",
  });

  // Load tables from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tables") || "[]");
    setTables(stored);
  }, []);

  const saveTables = (updatedTables) => {
    setTables(updatedTables);
    localStorage.setItem("tables", JSON.stringify(updatedTables));
  };

  const handleOpenPopup = (table = null) => {
    if (table) {
      setNewTable({
        tableNumber: table.tableNumber,
        tableStatus: table.tableStatus,
        capacity: table.capacity,
        section: table.section,
        locationDescription: table.locationDescription,
      });
      setEditTableId(table.id);
    } else {
      setNewTable({
        tableNumber: "",
        tableStatus: "AVAILABLE",
        capacity: 1,
        section: "",
        locationDescription: "",
      });
      setEditTableId(null);
    }
    setShowPopup(true);
    setDropdownOpen(null);
  };

  const handleSaveTable = () => {
    if (!newTable.tableNumber.trim()) {
      alert("Please enter a table number");
      return;
    }

    let newTableId;
    if (editTableId) {
      const updated = tables.map((t) =>
        t.id === editTableId ? { ...t, ...newTable } : t
      );
      saveTables(updated);
      newTableId = editTableId;
    } else {
      const newId = tables.length ? tables[tables.length - 1].id + 1 : 1;
      const newEntry = { id: newId, ...newTable };
      saveTables([...tables, newEntry]);
      newTableId = newId;
    }

    setShowPopup(false);
    setCurrentTableId(newTableId);
    setShowWaiterPopup(true); // Open waiter popup next
  };

  const handleSaveWaiter = () => {
    if (!waiter.waiterName.trim() || !waiter.waiterEmail.trim()) {
      alert("Please fill waiter name and email");
      return;
    }

    const updated = tables.map((t) =>
      t.id === currentTableId
        ? { ...t, waiterName: waiter.waiterName, waiterEmail: waiter.waiterEmail }
        : t
    );

    saveTables(updated);
    setShowWaiterPopup(false);
    setWaiter({ waiterName: "", waiterEmail: "" });
  };

  const handleDeleteTable = (id) => {
    const updated = tables.filter((t) => t.id !== id);
    saveTables(updated);
  };

  const handleChangeStatus = (id, newStatus) => {
    const updated = tables.map((t) =>
      t.id === id ? { ...t, tableStatus: newStatus } : t
    );
    saveTables(updated);
  };

  return (
    <div className="admin-tables-page">
      <h2 className="admin-page-title">
        <Sofa size={22} /> Table Management
      </h2>

      <div className="admin-add-table-section admin-right-align">
        <button onClick={() => handleOpenPopup()}>
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
              <div className="admin-dropdown-container">
                <button
                  className="admin-dots-btn"
                  onClick={() =>
                    setDropdownOpen(dropdownOpen === table.id ? null : table.id)
                  }
                >
                  <MoreVertical size={18} />
                </button>
                {dropdownOpen === table.id && (
                  <div className="admin-dropdown-menu">
                    <button onClick={() => handleOpenPopup(table)}>Edit</button>
                    <button onClick={() => handleDeleteTable(table.id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>

            <p>Status: {table.tableStatus}</p>
            <p>Capacity: {table.capacity}</p>
            <p>Section: {table.section || "—"}</p>
            <p>Location: {table.locationDescription || "—"}</p>
            <p>
              Waiter:{" "}
              {table.waiterName ? (
                <>
                  <User size={14} /> {table.waiterName}
                </>
              ) : (
                "—"
              )}
            </p>

            <div className="admin-actions">
              <button onClick={() => handleChangeStatus(table.id, "AVAILABLE")}>
                <CheckCircle size={16} /> Available
              </button>
              <button onClick={() => handleChangeStatus(table.id, "BOOKED")}>
                <XCircle size={16} /> Booked
              </button>
              <button onClick={() => handleChangeStatus(table.id, "CLEANING")}>
                <Brush size={16} /> Cleaning
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* === Table Form Popup === */}
      {showPopup && (
        <div className="admin-popup-overlay">
          <div className="admin-popup">
            <button className="admin-popup-close" onClick={() => setShowPopup(false)}>
              <X size={18} />
            </button>
            <h3>{editTableId ? "Edit Table" : "Add Table"}</h3>

            <label>
              Table Number:
              <input
                type="text"
                value={newTable.tableNumber}
                onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
              />
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
                onChange={(e) => setNewTable({ ...newTable, section: e.target.value })}
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

            <div className="admin-popup-actions">
              <button onClick={handleSaveTable}>Save & Assign Waiter</button>
            </div>
          </div>
        </div>
      )}

      {/* === Waiter Assign Popup === */}
      {showWaiterPopup && (
        <div className="admin-popup-overlay">
          <div className="admin-popup">
            <button className="admin-popup-close" onClick={() => setShowWaiterPopup(false)}>
              <X size={18} />
            </button>
            <h3>Assign Waiter to Table</h3>

            <label>
              Waiter Name:
              <input
                type="text"
                placeholder="e.g. Yassin"
                value={waiter.waiterName}
                onChange={(e) => setWaiter({ ...waiter, waiterName: e.target.value })}
              />
            </label>

            <label>
              Waiter Email:
              <input
                type="email"
                placeholder="e.g. yassin@yopmail.com"
                value={waiter.waiterEmail}
                onChange={(e) => setWaiter({ ...waiter, waiterEmail: e.target.value })}
              />
            </label>

            <div className="admin-popup-actions">
              <button onClick={handleSaveWaiter}>Save Waiter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
