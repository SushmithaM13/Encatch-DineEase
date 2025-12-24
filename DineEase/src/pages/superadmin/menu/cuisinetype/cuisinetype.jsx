import React, { useState, useEffect, useCallback } from "react";
import "./CuisineType.css";

export default function CuisineType() {
  const [cuisines, setCuisines] = useState([]);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const organizationId = localStorage.getItem("organizationId");
  const token = localStorage.getItem("token");

  // === Fetch cuisines ===
  const fetchCuisines = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:8082/dine-ease/api/v1/menu/cuisine-types?organizationId=${organizationId}&active=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch cuisines");
      const data = await res.json();
      setCuisines(data);
    } catch (err) {
      console.error("Error fetching cuisines:", err);
    }
  }, [organizationId, token]);

  useEffect(() => {
    fetchCuisines();
  }, [fetchCuisines]);

  // === Add or Update Cuisine ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a cuisine name.");
      return;
    }

    const url = editId
      ? `http://localhost:8082/dine-ease/api/v1/menu/cuisine-types/${editId}`
      : "http://localhost:8082/dine-ease/api/v1/menu/cuisine-types/add";

    const method = editId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
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

      if (response.ok) {
        alert(editId ? "Cuisine updated successfully!" : "Cuisine added successfully!");
        setName("");
        setSortOrder(0);
        setEditId(null);
        fetchCuisines();
      } else {
        alert("Failed to save cuisine.");
      }
    } catch (error) {
      console.error("Error saving cuisine:", error);
    }
  };

  // === Edit Cuisine ===
  const handleEdit = (item) => {
    setEditId(item.id);
    setName(item.name);
    setSortOrder(item.sortOrder);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // === Delete Cuisine ===
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this cuisine?")) return;

    try {
      const res = await fetch(
        `http://localhost:8082/dine-ease/api/v1/menu/cuisine-types/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        alert("Cuisine deleted successfully!");
        fetchCuisines();
      } else {
        alert("Failed to delete cuisine.");
      }
    } catch (err) {
      console.error("Error deleting cuisine:", err);
    }
  };

  // === Pagination ===
  const totalPages = Math.ceil(cuisines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = cuisines.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="cuisine-container">
      <h2 className="cuisine-heading">Cuisine Types</h2>

      <form className="cuisine-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Cuisine Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Sort Order"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        />
        <button type="submit">
          {editId ? "Update Cuisine" : "Add Cuisine"}
        </button>
      </form>

      {/* ==== Web View Table ==== */}
      <div className="cuisine-table web-view">
        <table>
          <thead>
            <tr>
              <th>SL.No</th>
              <th>Cuisine Name</th>
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
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No cuisines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==== Mobile Cards ==== */}
      <div className="mobile-view">
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <div className="cuisine-card" key={item.id}>
              <h4>{item.name}</h4>
              <p><strong>ID:</strong> {item.id}</p>
              <p><strong>Active:</strong> {item.active ? "Yes" : "No"}</p>
              <p><strong>Sort Order:</strong> {item.sortOrder}</p>
              <div className="card-buttons">
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No cuisines found.</p>
        )}
      </div>

      {/* ==== Pagination ==== */}
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
