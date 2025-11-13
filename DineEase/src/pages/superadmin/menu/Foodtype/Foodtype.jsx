import React, { useState, useEffect, useCallback } from "react";
import "./FoodType.css";

export default function FoodType() {
  const [foodTypes, setFoodTypes] = useState([]);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const organizationId = localStorage.getItem("organizationId");
  const token = localStorage.getItem("token");

  // === GET Food Types ===
  const fetchFoodTypes = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:8082/dine-ease/api/v1/menu/food-types?organizationId=${organizationId}&active=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch food types");
      const data = await res.json();
      setFoodTypes(data);
    } catch (err) {
      console.error("Error fetching food types:", err);
    }
  }, [organizationId, token]);

  useEffect(() => {
    fetchFoodTypes();
  }, [fetchFoodTypes]);

  // === POST / PUT Food Type ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a food type name");
      return;
    }

    const apiUrl = editId
      ? `http://localhost:8082/dine-ease/api/v1/menu/food-types/${editId}`
      : "http://localhost:8082/dine-ease/api/v1/menu/food-types/add";

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
        fetchFoodTypes();
        alert(editId ? "Food Type updated!" : "Food Type added!");
      } else {
        alert("Operation failed! Check details or server connection.");
      }
    } catch (err) {
      console.error("Error submitting food type:", err);
    }
  };

  // === DELETE Food Type ===
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food type?")) return;

    try {
      const res = await fetch(
        `http://localhost:8082/dine-ease/api/v1/menu/food-types/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        fetchFoodTypes();
        alert("Food Type deleted successfully!");
      } else {
        alert("Failed to delete food type.");
      }
    } catch (err) {
      console.error("Error deleting food type:", err);
    }
  };

  // === Edit Mode ===
  const handleEdit = (item) => {
    setName(item.name);
    setSortOrder(item.sortOrder);
    setEditId(item.id);
  };

  // === Pagination ===
  const totalPages = Math.ceil(foodTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = foodTypes.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="foodtype-container">
      <h2 className="foodtype-heading">🍽️ Food Types</h2>

      {/* Add / Edit Form */}
      <form className="foodtype-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Food Type Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Sort Order"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        />
        <button type="submit">{editId ? "Update Food Type" : "Add Food Type"}</button>
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

      {/* Web View Table */}
      <div className="foodtype-table web-view">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Food Type Name</th>
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
                    <button className="edit-btn" onClick={() => handleEdit(item)}>
                      ✏️
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No food types found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View Cards */}
      <div className="mobile-view">
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <div className="foodtype-card" key={item.id}>
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
          <p className="no-data">No food types found.</p>
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
