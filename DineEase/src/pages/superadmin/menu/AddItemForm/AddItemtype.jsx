import React, { useState, useEffect, useCallback } from "react";
import "./AddItemType.css";

export default function ItemType() {
  const [itemTypes, setItemTypes] = useState([]);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const organizationId = localStorage.getItem("organizationId");
  //console.log("orgsnizationid for additemstype:", organizationId)
  const token = localStorage.getItem("token");

  // === Fetch Item Types (GET) ===
  const fetchItemTypes = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:8082/dine-ease/api/v1/menu/item-types?organizationId=${organizationId}&active=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch item types");
      const data = await res.json();
     //("data for additemtype",data);
      setItemTypes(data);
    } catch (err) {
      console.error("Error fetching item types:", err);
    }
  }, [organizationId, token]);

  useEffect(() => {
    fetchItemTypes();
  }, [fetchItemTypes]);

  // === Add or Update Item Type ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter an item type name");
      return;
    }

    const apiUrl = editId
      ? `http://localhost:8082/dine-ease/api/v1/menu/item-types/${editId}`
      : "http://localhost:8082/dine-ease/api/v1/menu/item-types";

    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(apiUrl, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          name,
          sortOrder: Number(sortOrder),
          active: true,
        }),
      });

      if (res.ok) {
        setName("");
        setSortOrder(0);
        setEditId(null);
        fetchItemTypes();
        alert(editId ? "Item Type updated successfully!" : "Item Type added!");
      } else {
        alert("Failed to save item type.");
      }
    } catch (err) {
      console.error("Error submitting item type:", err);
    }
  };

  // === Delete Item Type ===
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item type?")) return;

    try {
      const res = await fetch(
        `http://localhost:8082/dine-ease/api/v1/menu/item-types/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        fetchItemTypes();
        alert("Item Type deleted successfully!");
      } else {
        alert("Failed to delete item type.");
      }
    } catch (err) {
      console.error("Error deleting item type:", err);
    }
  };

  // === Edit Mode ===
  const handleEdit = (item) => {
    setName(item.name);
    setSortOrder(item.sortOrder);
    setEditId(item.id);
  };

  // === Pagination ===
  const totalPages = Math.ceil(itemTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = itemTypes.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="itemtype-container">
      <h2 className="itemtype-heading">🍕 Item Types</h2>

      {/* Add / Edit Form */}
      <form className="itemtype-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Item Type Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Sort Order"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        />
        <button type="submit">{editId ? "Update Item Type" : "Add Item Type"}</button>
        {editId && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setEditId(null);
              setName("");
              setSortOrder(0);
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Web Table View */}
      <div className="itemtype-table web-view">
        <table>
          <thead>
            <tr>
              <th>SL.No</th>
              <th>Item Type Name</th>
              <th>Active</th>
              <th>Sort Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.active ? "Yes" : "No"}</td>
                  <td>{item.sortOrder}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(item)}>✏️</button>
                    <button className="delete-btn" onClick={() => handleDelete(item.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No item types found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-view">
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <div className="itemtype-card" key={item.id}>
              <h4>{item.name}</h4>
              <p><strong>ID:</strong> {item.id}</p>
              <p><strong>Active:</strong> {item.active ? "Yes" : "No"}</p>
              <p><strong>Sort Order:</strong> {item.sortOrder}</p>
              <div className="card-actions">
                <button className="edit-btn" onClick={() => handleEdit(item)}>✏️</button>
                <button className="delete-btn" onClick={() => handleDelete(item.id)}>🗑️</button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No item types found.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
