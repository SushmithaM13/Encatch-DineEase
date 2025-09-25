import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Brush, Plus, Sofa, MoreVertical, X } from "lucide-react";
import "./tables.css";

export default function AdminTableManagement() {
  const [tables, setTables] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editTableId, setEditTableId] = useState(null);
  const [newTable, setNewTable] = useState({
    capacity: 4,
    waiterId: "",
    waiterName: "",
    status: "available",
  });
  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tables") || "[]");
    setTables(stored);
  }, []);

  const saveTables = (newTables) => {
    setTables(newTables);
    localStorage.setItem("tables", JSON.stringify(newTables));
  };

  const handleOpenPopup = (table = null) => {
    if (table) {
      setNewTable({
        capacity: table.capacity,
        waiterId: table.waiterId,
        waiterName: table.waiterName,
        status: table.status,
      });
      setEditTableId(table.id);
    } else {
      setNewTable({
        capacity: 4,
        waiterId: "",
        waiterName: "",
        status: "available",
      });
      setEditTableId(null);
    }
    setShowPopup(true);
    setDropdownOpen(null);
  };

  const handleSaveTable = () => {
    if (editTableId) {
      const updated = tables.map((t) =>
        t.id === editTableId ? { ...t, ...newTable } : t
      );
      saveTables(updated);
    } else {
      const tableToAdd = {
        id: tables.length + 1,
        ...newTable,
      };
      saveTables([...tables, tableToAdd]);
    }
    setShowPopup(false);
  };

  const handleDeleteTable = (id) => {
    const updated = tables.filter((t) => t.id !== id);
    saveTables(updated);
    setDropdownOpen(null);
  };

  const handleChangeStatus = (id, newStatus) => {
    const updated = tables.map((t) =>
      t.id === id ? { ...t, status: newStatus } : t
    );
    saveTables(updated);
  };

  return (
    <div className="tables-page">
      <h2 className="page-title"><Sofa size={22} /> Table Management</h2>

      {/* Add Table Button aligned to right */}
      <div className="add-table-section right-align">
        <button onClick={() => handleOpenPopup()}>
          <Plus size={16} /> Add Table
        </button>
      </div>

      {/* Stats */}
<div className="stats">
  <p className="stat-total">Total: {tables.length}</p>
  <p className="stat-available">
    Available: {tables.filter((t) => t.status === "available").length}
  </p>
  <p className="stat-booked">
    Booked: {tables.filter((t) => t.status === "booked").length}
  </p>
  <p className="stat-cleaning">
    Cleaning: {tables.filter((t) => t.status === "cleaning").length}
  </p>
</div>


      {/* Table Grid */}
      <div className="tables-grid">
        {tables.map((table) => (
          <div key={table.id} className={`table-card ${table.status}`}>
            <div className="table-card-header">
              <h3>Table {table.id}</h3>
              <div className="dropdown-container">
                <button
                  className="dots-btn"
                  onClick={() =>
                    setDropdownOpen(dropdownOpen === table.id ? null : table.id)
                  }
                >
                  <MoreVertical size={18} />
                </button>
                {dropdownOpen === table.id && (
                  <div className="dropdown-menu">
                    <button onClick={() => handleOpenPopup(table)}>Edit</button>
                    <button onClick={() => handleDeleteTable(table.id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>

            <p>
              {table.status === "booked"
                ? `🚨 Table ${table.id} (${table.capacity}-seater) booked! Waiter ${table.waiterName || "—"} (${table.waiterId || "N/A"}) be ready to serve.`
                : `Status: ${table.status}`}
            </p>
            <p>Capacity: {table.capacity}</p>
            <p>Waiter: {table.waiterName || "—"} ({table.waiterId || "N/A"})</p>

            <div className="actions">
              <button onClick={() => handleChangeStatus(table.id, "available")}>
                <CheckCircle size={16} /> Available
              </button>
              <button onClick={() => handleChangeStatus(table.id, "booked")}>
                <XCircle size={16} /> Booked
              </button>
              <button onClick={() => handleChangeStatus(table.id, "cleaning")}>
                <Brush size={16} /> Cleaning
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            {/* Close button top-right */}
            <button className="popup-close" onClick={() => setShowPopup(false)}>
              <X size={18} />
            </button>

            <h3>{editTableId ? "Edit Table" : "Add New Table"}</h3>

            <label>
              Capacity:
              <select
                value={newTable.capacity}
                onChange={(e) =>
                  setNewTable({ ...newTable, capacity: Number(e.target.value) })
                }
              >
                <option value="2">2-seater</option>
                <option value="4">4-seater</option>
                <option value="6">6-seater</option>
                <option value="8">8-seater</option>
                <option value="10">10-seater</option>
                <option value="12">12-seater</option>
              </select>
            </label>

            <label>
              Waiter ID:
              <input
                type="text"
                value={newTable.waiterId}
                onChange={(e) =>
                  setNewTable({ ...newTable, waiterId: e.target.value })
                }
              />
            </label>

            <label>
              Waiter Name:
              <input
                type="text"
                value={newTable.waiterName}
                onChange={(e) =>
                  setNewTable({ ...newTable, waiterName: e.target.value })
                }
              />
            </label>

            <label>
              Status:
              <select
                value={newTable.status}
                onChange={(e) =>
                  setNewTable({ ...newTable, status: e.target.value })
                }
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </label>

            <div className="popup-actions">
              <button onClick={handleSaveTable}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
