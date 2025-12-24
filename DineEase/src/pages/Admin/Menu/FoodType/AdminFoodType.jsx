import React, { useEffect, useState } from "react";
import { PlusSquare, Edit3, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminFoodType.css";

export default function AdminFoodType() {
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const FOOD_TYPE_API = "http://localhost:8082/dine-ease/api/v1/menu/food-types";

  const [organizationId, setOrganizationId] = useState(null);
  const [foodTypes, setFoodTypes] = useState([]);
  const [formData, setFormData] = useState({ name: "", sortOrder: 0, active: true });
  const [editingFood, setEditingFood] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletePopup, setDeletePopup] = useState({
    show: false,
    foodId: null,
    foodName: "",
    error: false,
  });

  //  Fetch organizationId
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No token found. Please login again.");
          return;
        }
        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Profile fetch failed");
        const data = await res.json();
        setOrganizationId(data.organizationId);
      } catch (err) {
        toast.error("Profile fetch failed!");
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  //  Fetch Food Types
  const fetchFoodTypes = async (orgId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${FOOD_TYPE_API}?organizationId=${orgId}&active=true`, {
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

  useEffect(() => {
    if (organizationId) fetchFoodTypes(organizationId);
  }, [organizationId]);

  //  Add / Update Food Type
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.warning("Name is required");

    try {
      const token = localStorage.getItem("token");
      const method = editingFood ? "PUT" : "POST";
      const url = editingFood
        ? `${FOOD_TYPE_API}/${editingFood.id}`
        : FOOD_TYPE_API;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          organizationId,
        }),
      });

      if (!res.ok) throw new Error("Failed to save food type");
      toast.success(editingFood ? "Updated successfully!" : "Added successfully!");

      setFormData({ name: "", sortOrder: 0, active: true });
      setEditingFood(null);
      setShowModal(false);
      fetchFoodTypes(organizationId);
    } catch (err) {
      toast.error("Save failed!");
      console.error(err);
    }
  };

  //  Delete Food Type
  const handleDeleteFood = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${FOOD_TYPE_API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 409) {
        setDeletePopup((prev) => ({ ...prev, show: true, error: true }));
        return;
      }

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Deleted successfully!");
      setDeletePopup({ show: false, foodId: null, foodName: "", error: false });
      fetchFoodTypes(organizationId);
    } catch (err) {
      console.error(err);
      setDeletePopup({ ...deletePopup, error: true });
    }
  };

  return (
    <div className="admin-foodtype-page">
      <ToastContainer position="top-center" />

      {/* ---------- Header ---------- */}
      <div className="admin-foodtype-header">
        <h2 className="admin-foodtype-title">Food Type Management</h2>
        <button className="admin-foodtype-add-btn" onClick={() => setShowModal(true)}>
          <PlusSquare size={18} /> Add Food Type
        </button>
      </div>

      {/* ---------- Popup Add/Edit Form ---------- */}
      {showModal && (
        <div className="admin-foodtype-modal-overlay">
          <div className="admin-foodtype-modal">
            <h3>{editingFood ? "Edit Food Type" : "Add New Food Type"}</h3>
            <form onSubmit={handleSubmit} className="admin-foodtype-form">
              <input
                type="text"
                placeholder="Food Type Name"
                className="admin-foodtype-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Sort Order"
                className="admin-foodtype-input small"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: +e.target.value })}
                required
              />
              <select
                className="admin-foodtype-select"
                value={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.value === "true" })}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <div className="admin-foodtype-btn-group">
                <button type="submit" className="admin-foodtype-submit-btn">
                  {editingFood ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="admin-foodtype-cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setEditingFood(null);
                    setFormData({ name: "", sortOrder: 0, active: true });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Table View ---------- */}
      <h3 className="admin-foodtype-subtitle">Available Food Types</h3>
      <div className="admin-foodtype-table-container">
        <table className="admin-foodtype-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Food Type Name</th>
              <th>Sort Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {foodTypes.length === 0 ? (
              <tr>
                <td colSpan="5" className="admin-foodtype-empty">No food types found.</td>
              </tr>
            ) : (
              foodTypes.map((food, index) => (
                <tr key={food.id || index}>
                  <td>{index + 1}</td>
                  <td>{food.name}</td>
                  <td>{food.sortOrder}</td>
                  <td>{food.active ? "Active" : "Inactive"}</td>
                  <td className="admin-foodtype-actions">
                    <button
                      className="admin-foodtype-edit-btn"
                      onClick={() => {
                        setEditingFood(food);
                        setFormData({
                          name: food.name,
                          sortOrder: food.sortOrder,
                          active: food.active,
                        });
                        setShowModal(true);
                      }}
                    >
                      <Edit3 size={16} /> 
                    </button>
                    <button
                      className="admin-foodtype-delete-btn"
                      onClick={() =>
                        setDeletePopup({
                          show: true,
                          foodId: food.id,
                          foodName: food.name,
                          error: false,
                        })
                      }
                    >
                      <Trash2 size={16} /> 
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Delete Popup ---------- */}
      {deletePopup.show && (
        <div className="admin-foodtype-popup-overlay">
          <div className="admin-foodtype-popup">
            {!deletePopup.error ? (
              <>
                <h3>Delete Food Type</h3>
                <p>
                  Are you sure you want to delete <strong>{deletePopup.foodName}</strong>?
                </p>
                <div className="admin-foodtype-btn-group">
                  <button
                    onClick={() => handleDeleteFood(deletePopup.foodId)}
                    className="admin-foodtype-delete-confirm-btn"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() =>
                      setDeletePopup({ show: false, foodId: null, foodName: "", error: false })
                    }
                    className="admin-foodtype-cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Cannot Delete Food Type</h3>
                <p>
                  <strong>{deletePopup.foodName}</strong> is used in menu and cannot be deleted.
                </p>
                <div className="admin-foodtype-btn-group">
                  <button
                    onClick={() =>
                      setDeletePopup({ show: false, foodId: null, foodName: "", error: false })
                    }
                    className="admin-foodtype-cancel-btn"
                  >
                    OK
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
