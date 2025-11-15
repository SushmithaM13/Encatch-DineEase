import React, { useEffect, useState } from "react";
import { PlusSquare, Edit3, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminCusineType.css";

export default function AdminCuisineType() {
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const CUISINE_TYPE_API = "http://localhost:8082/dine-ease/api/v1/menu/cuisine-types";

  const [organizationId, setOrganizationId] = useState(null);
  const [cuisines, setCuisines] = useState([]);
  const [formData, setFormData] = useState({ name: "", sortOrder: 0, active: true });
  const [editingCuisine, setEditingCuisine] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletePopup, setDeletePopup] = useState({
    show: false,
    cuisineId: null,
    cuisineName: "",
    error: false,
  });

  // Fetch organizationId
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("No token found. Please login.");

        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Profile fetch failed");
        const data = await res.json();
        setOrganizationId(data.organizationId);
      } catch (err) {
        console.error(err);
        toast.error("Profile fetch failed!");
      }
    };
    fetchProfile();
  }, []);

  // Fetch cuisines
  const fetchCuisines = async (orgId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${CUISINE_TYPE_API}?organizationId=${orgId}&active=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch cuisines");
      const data = await res.json();
      setCuisines(data);
    } catch (err) {
      console.error(err);
      toast.error("Cuisine fetch failed!");
    }
  };

  useEffect(() => {
    if (organizationId) fetchCuisines(organizationId);
  }, [organizationId]);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.name.trim()) return toast.warning("Name is required");

  try {
    const token = localStorage.getItem("token");

    // Use /add for POST
    const url = editingCuisine
      ? `${CUISINE_TYPE_API}/${editingCuisine.id}` // PUT for edit
      : `${CUISINE_TYPE_API}/add`; // POST for add

    const method = editingCuisine ? "PUT" : "POST";

    const payload = {
      name: formData.name,
      sortOrder: formData.sortOrder,
      active: formData.active,
      organizationId, // if backend requires orgId for add
    };

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to save cuisine: ${errorText}`);
    }

    toast.success(editingCuisine ? "Updated successfully!" : "Added successfully!");

    setFormData({ name: "", sortOrder: 0, active: true });
    setEditingCuisine(null);
    setShowModal(false);

    if (organizationId) fetchCuisines(organizationId);
  } catch (err) {
    console.error(err);
    toast.error("Save failed! Check console for details.");
  }
};


  // Delete cuisine
  const handleDeleteCuisine = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${CUISINE_TYPE_API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 409) {
        setDeletePopup((prev) => ({ ...prev, show: true, error: true }));
        return;
      }

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Deleted successfully!");
      setDeletePopup({ show: false, cuisineId: null, cuisineName: "", error: false });
      fetchCuisines(organizationId);
    } catch (err) {
      console.error(err);
      setDeletePopup({ ...deletePopup, error: true });
    }
  };

  return (
    <div className="admin-foodtype-page">
      <ToastContainer position="top-center" />

      {/* Header */}
      <div className="admin-foodtype-header">
        <h2 className="admin-foodtype-title">Cuisine Type Management</h2>
        <button className="admin-foodtype-add-btn" onClick={() => setShowModal(true)}>
          <PlusSquare size={18} /> Add Cuisine Type
        </button>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="admin-foodtype-modal-overlay">
          <div className="admin-foodtype-modal">
            <h3>{editingCuisine ? "Edit Cuisine Type" : "Add New Cuisine Type"}</h3>
            <form onSubmit={handleSubmit} className="admin-foodtype-form">
              <input
                type="text"
                placeholder="Cuisine Name"
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
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.value === "true" })
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <div className="admin-foodtype-btn-group">
                <button type="submit" className="admin-foodtype-submit-btn">
                  {editingCuisine ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="admin-foodtype-cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCuisine(null);
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

      {/* Table View */}
      <h3 className="admin-foodtype-subtitle">Available Cuisine Types</h3>
      <div className="admin-foodtype-table-container">
        <table className="admin-foodtype-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cuisine Name</th>
              <th>Sort Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cuisines.length === 0 ? (
              <tr>
                <td colSpan="5" className="admin-foodtype-empty">
                  No cuisine types found.
                </td>
              </tr>
            ) : (
              cuisines.map((cuisine, index) => (
                <tr key={cuisine.id || index}>
                  <td>{index + 1}</td>
                  <td>{cuisine.name}</td>
                  <td>{cuisine.sortOrder}</td>
                  <td>{cuisine.active ? "Active" : "Inactive"}</td>
                  <td className="admin-foodtype-actions">
                    <button
                      className="admin-foodtype-edit-btn"
                      onClick={() => {
                        setEditingCuisine(cuisine);
                        setFormData({
                          name: cuisine.name,
                          sortOrder: cuisine.sortOrder,
                          active: cuisine.active,
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
                          cuisineId: cuisine.id,
                          cuisineName: cuisine.name,
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

      {/* Delete Popup */}
      {deletePopup.show && (
        <div className="admin-foodtype-popup-overlay">
          <div className="admin-foodtype-popup">
            {!deletePopup.error ? (
              <>
                <h3>Delete Cuisine Type</h3>
                <p>
                  Are you sure you want to delete <strong>{deletePopup.cuisineName}</strong>?
                </p>
                <div className="admin-foodtype-btn-group">
                  <button
                    onClick={() => handleDeleteCuisine(deletePopup.cuisineId)}
                    className="admin-foodtype-delete-confirm-btn"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() =>
                      setDeletePopup({ show: false, cuisineId: null, cuisineName: "", error: false })
                    }
                    className="admin-foodtype-cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Cannot Delete Cuisine Type</h3>
                <p>
                  <strong>{deletePopup.cuisineName}</strong> is used in menu and cannot be deleted.
                </p>
                <div className="admin-foodtype-btn-group">
                  <button
                    onClick={() =>
                      setDeletePopup({ show: false, cuisineId: null, cuisineName: "", error: false })
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
