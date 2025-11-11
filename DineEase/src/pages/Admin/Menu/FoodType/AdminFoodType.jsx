import React, { useEffect, useState } from "react";
import { PlusCircle, Edit3, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminFoodType.css";

export default function AdminFoodType() {
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const FOOD_TYPE_API = "http://localhost:8082/dine-ease/api/v1/menu/food-types";

  const [organizationId, setOrganizationId] = useState(null);
  const [foodTypes, setFoodTypes] = useState([]);
  const [newFoodType, setNewFoodType] = useState({ name: "", sortOrder: 0, active: true });
  const [editFood, setEditFood] = useState(null);
  // const [deleteFood, setDeleteFood] = useState(null);

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
  }, []);

  // ✅ Fetch food types
  useEffect(() => {
    if (!organizationId) return;

    const fetchFoodTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${FOOD_TYPE_API}?organizationId=${organizationId}&active=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch food types");
        const data = await res.json();
        setFoodTypes(data);
      } catch (err) {
        toast.error("Food types fetch failed!");
        console.error(err);
      }
    };

    fetchFoodTypes();
  }, [organizationId]);

  // ✅ Add new food type
  const handleAddFoodType = async () => {
    if (!newFoodType.name.trim()) return toast.warning("Name is required");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(FOOD_TYPE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newFoodType, organizationId }),
      });

      if (!res.ok) throw new Error("Failed to add food type");

      toast.success("Food type added successfully!");
      setNewFoodType({ name: "", sortOrder: 0, active: true });

      const data = await fetch(`${FOOD_TYPE_API}?organizationId=${organizationId}&active=true`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      setFoodTypes(data);
    } catch (err) {
      toast.error("Add failed!");
      console.error(err);
    }
  };

  // ✅ Update food type
  const handleUpdateFoodType = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${FOOD_TYPE_API}/${editFood.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editFood.name,
          sortOrder: editFood.sortOrder,
          active: editFood.active,
        }),
      });

      if (!res.ok) throw new Error("Failed to update food type");

      toast.success("Food type updated!");
      setEditFood(null);

      const data = await fetch(`${FOOD_TYPE_API}?organizationId=${organizationId}&active=true`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      setFoodTypes(data);
    } catch (err) {
      toast.error("Update failed!");
      console.error(err);
    }
  };

  return (
    <div className="admin-food-container">
      <ToastContainer />
      <h2 className="admin-food-title">Food Types</h2>

      {/* ➕ Add Food Type */}
      <div className="admin-food-add-section">
        <h3 className="admin-food-add-heading">Add Food Type</h3>
        <div className="admin-food-add-form">
          <input
            type="text"
            className="admin-food-input"
            placeholder="Enter name"
            value={newFoodType.name}
            onChange={(e) => setNewFoodType({ ...newFoodType, name: e.target.value })}
          />
          <input
            type="number"
            className="admin-food-input small"
            placeholder="Sort Order"
            value={newFoodType.sortOrder}
            onChange={(e) => setNewFoodType({ ...newFoodType, sortOrder: +e.target.value })}
          />
          <button onClick={handleAddFoodType} className="admin-food-add-btn">
            <PlusCircle size={18} /> Add
          </button>
        </div>
      </div>

      {/* 📋 List */}
      <div className="admin-food-list-section">
        <h3 className="admin-food-list-heading">Existing Food Types</h3>
        {foodTypes.length === 0 ? (
          <p className="admin-food-empty">No food types found.</p>
        ) : (
          <table className="admin-food-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Sort Order</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {foodTypes.map((type) => (
                <tr key={type.id}>
                  <td>{type.name}</td>
                  <td>{type.sortOrder}</td>
                  <td>{type.active ? "Yes" : "No"}</td>
                  <td className="admin-food-actions">
                    <button onClick={() => setEditFood(type)} className="admin-food-edit-btn">
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
      {editFood && (
        <div className="admin-food-popup-overlay">
          <div className="admin-food-popup">
            <h3 className="admin-food-popup-title">Edit Food Type</h3>
            <input
              type="text"
              className="admin-food-popup-input"
              value={editFood.name}
              onChange={(e) => setEditFood({ ...editFood, name: e.target.value })}
            />
            <input
              type="number"
              className="admin-food-popup-input"
              value={editFood.sortOrder}
              onChange={(e) => setEditFood({ ...editFood, sortOrder: +e.target.value })}
            />
            <div className="admin-food-popup-actions">
              <button onClick={handleUpdateFoodType} className="admin-food-update-btn">
                Update
              </button>
              <button onClick={() => setEditFood(null)} className="admin-food-cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
