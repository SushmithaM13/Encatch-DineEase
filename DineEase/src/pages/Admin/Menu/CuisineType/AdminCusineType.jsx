import React, { useEffect, useState } from "react";
import { PlusCircle, Edit3 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminCusineType.css";

export default function AdminCusineType() {
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const CUISINE_TYPE_API = "http://localhost:8082/dine-ease/api/v1/menu/cuisine-types";

  const [organizationId, setOrganizationId] = useState(null);
  const [cuisines, setCuisines] = useState([]);
  const [newCuisine, setNewCuisine] = useState({ name: "", sortOrder: 0, active: true });
  const [editCuisine, setEditCuisine] = useState(null);

  // ✅ Fetch organizationId from staff profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No token found. Please login again.");
          return;
        }

        const res = await fetch(PROFILE_API, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401 || res.status === 403) {
          toast.error("Session expired or unauthorized. Please login again.");
          localStorage.removeItem("token");
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setOrganizationId(data.organizationId);
      } catch (err) {
        toast.error("Profile fetch failed!");
        console.error(err);
      }
    };

    fetchProfile();
  }, [PROFILE_API]);

  // ✅ Fetch cuisine types
  useEffect(() => {
    if (!organizationId) return;

    const fetchCuisines = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${CUISINE_TYPE_API}?organizationId=${organizationId}&active=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch cuisines");
        const data = await res.json();
        setCuisines(data);
      } catch (err) {
        toast.error("Cuisine fetch failed!");
        console.error(err);
      }
    };

    fetchCuisines();
  }, [organizationId, CUISINE_TYPE_API]);

  // ✅ Add new cuisine
  const handleAddCuisine = async () => {
    if (!newCuisine.name.trim()) return toast.warning("Name is required");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${CUISINE_TYPE_API}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newCuisine, organizationId }),
      });

      if (!res.ok) throw new Error("Failed to add cuisine");

      toast.success("Cuisine added successfully!");
      setNewCuisine({ name: "", sortOrder: 0, active: true });

      const data = await fetch(`${CUISINE_TYPE_API}?organizationId=${organizationId}&active=true`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      setCuisines(data);
    } catch (err) {
      toast.error("Add failed!");
      console.error(err);
    }
  };

  // ✅ Update cuisine
  const handleUpdateCuisine = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${CUISINE_TYPE_API}/${editCuisine.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editCuisine.name,
          sortOrder: editCuisine.sortOrder,
          active: editCuisine.active,
        }),
      });

      if (!res.ok) throw new Error("Failed to update cuisine");

      toast.success("Cuisine updated!");
      setEditCuisine(null);

      const data = await fetch(`${CUISINE_TYPE_API}?organizationId=${organizationId}&active=true`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      setCuisines(data);
    } catch (err) {
      toast.error("Update failed!");
      console.error(err);
    }
  };

  return (
    <div className="admin-cusine-container">
      <ToastContainer />
      <h2 className="admin-cusine-title">Cuisine Types</h2>

      {/* ➕ Add Cuisine */}
      <div className="admin-cusine-add-section">
        <h3 className="admin-cusine-add-heading">Add Cuisine Type</h3>
        <div className="admin-cusine-add-form">
          <input
            type="text"
            className="admin-cusine-input"
            placeholder="Enter name"
            value={newCuisine.name}
            onChange={(e) => setNewCuisine({ ...newCuisine, name: e.target.value })}
          />
          <input
            type="number"
            className="admin-cusine-input small"
            placeholder="Sort Order"
            value={newCuisine.sortOrder}
            onChange={(e) => setNewCuisine({ ...newCuisine, sortOrder: +e.target.value })}
          />
          <button onClick={handleAddCuisine} className="admin-cusine-add-btn">
            <PlusCircle size={18} /> Add
          </button>
        </div>
      </div>

      {/* 📋 List */}
      <div className="admin-cusine-list-section">
        <h3 className="admin-cusine-list-heading">Existing Cuisine Types</h3>
        {cuisines.length === 0 ? (
          <p className="admin-cusine-empty">No cuisines found.</p>
        ) : (
          <table className="admin-cusine-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Sort Order</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cuisines.map((type) => (
                <tr key={type.id}>
                  <td>{type.name}</td>
                  <td>{type.sortOrder}</td>
                  <td>{type.active ? "Yes" : "No"}</td>
                  <td className="admin-cusine-actions">
                    <button onClick={() => setEditCuisine(type)} className="admin-cusine-edit-btn">
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ✏️ Edit Popup */}
      {editCuisine && (
        <div className="admin-cusine-popup-overlay">
          <div className="admin-cusine-popup">
            <h3 className="admin-cusine-popup-title">Edit Cuisine Type</h3>
            <input
              type="text"
              className="admin-cusine-popup-input"
              value={editCuisine.name}
              onChange={(e) => setEditCuisine({ ...editCuisine, name: e.target.value })}
            />
            <input
              type="number"
              className="admin-cusine-popup-input"
              value={editCuisine.sortOrder}
              onChange={(e) => setEditCuisine({ ...editCuisine, sortOrder: +e.target.value })}
            />
            <div className="admin-cusine-popup-actions">
              <button onClick={handleUpdateCuisine} className="admin-cusine-update-btn">
                Update
              </button>
              <button onClick={() => setEditCuisine(null)} className="admin-cusine-cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
