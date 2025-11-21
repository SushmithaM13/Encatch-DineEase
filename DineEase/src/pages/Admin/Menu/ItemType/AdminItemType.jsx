import React, { useEffect, useState } from "react";
import { PlusSquare, Edit3, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminItemType.css";

export default function AdminItemType() {
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const ITEM_TYPE_API = "http://localhost:8082/dine-ease/api/v1/menu/item-types";

  const [organizationId, setOrganizationId] = useState(null);
  const [itemTypes, setItemTypes] = useState([]);
  const [formData, setFormData] = useState({ name: "", sortOrder: 0, active: true });
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletePopup, setDeletePopup] = useState({
    show: false,
    itemId: null,
    itemName: "",
    error: false,
  });

  // ✅ Fetch organizationId
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

  // ✅ Fetch Item Types
  const fetchItemTypes = async (orgId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${ITEM_TYPE_API}?organizationId=${orgId}&active=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch item types");
      const data = await res.json();
      setItemTypes(data);
    } catch (err) {
      toast.error("Item types fetch failed!");
      console.error(err);
    }
  };

  useEffect(() => {
    if (organizationId) fetchItemTypes(organizationId);
  }, [organizationId]);

  // ✅ Add / Update Item Type
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.warning("Name is required");

    try {
      const token = localStorage.getItem("token");
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem ? `${ITEM_TYPE_API}/${editingItem.id}` : ITEM_TYPE_API;

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

      if (!res.ok) throw new Error("Failed to save item type");
      toast.success(editingItem ? "Updated successfully!" : "Added successfully!");

      setFormData({ name: "", sortOrder: 0, active: true });
      setEditingItem(null);
      setShowModal(false);
      fetchItemTypes(organizationId);
    } catch (err) {
      toast.error("Save failed!");
      console.error(err);
    }
  };

  // ✅ Delete Item Type
  const handleDeleteItem = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${ITEM_TYPE_API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 409) {
        setDeletePopup((prev) => ({ ...prev, show: true, error: true }));
        return;
      }

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Deleted successfully!");
      setDeletePopup({ show: false, itemId: null, itemName: "", error: false });
      fetchItemTypes(organizationId);
    } catch (err) {
      console.error(err);
      setDeletePopup({ ...deletePopup, error: true });
    }
  };

  return (
    <div className="admin-itemtype-page">
      <ToastContainer position="top-center" />
      <div className="admin-itemtype-header">
        <h2 className="admin-itemtype-title">Item Type Management</h2>
        <button className="admin-itemtype-add-btn" onClick={() => setShowModal(true)}>
          <PlusSquare size={18} /> Add Item Type
        </button>
      </div>

      {/* Popup Form */}
      {showModal && (
        <div className="admin-itemtype-modal-overlay">
          <div className="admin-itemtype-modal">
            <h3>{editingItem ? "Edit Item Type" : "Add New Item Type"}</h3>
            <form onSubmit={handleSubmit} className="admin-itemtype-form">
              <input
                type="text"
                placeholder="Item Type Name"
                className="admin-itemtype-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Sort Order"
                className="admin-itemtype-input small"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: +e.target.value })}
                required
              />
              <select
                className="admin-itemtype-select"
                value={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.value === "true" })}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <div className="admin-itemtype-btn-group">
                <button type="submit" className="admin-itemtype-submit-btn">
                  {editingItem ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="admin-itemtype-cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
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

      {/* List of Item Types as Table */}
<h3 className="admin-itemtype-subtitle">Available Item Types</h3>
<div className="admin-itemtype-list">
  {itemTypes.length === 0 ? (
    <p className="admin-itemtype-empty">No item types found.</p>
  ) : (
    <table className="admin-itemtype-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Sort Order</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {itemTypes.map((item, index) => (
          <tr key={item.id || index}>
            <td>{index + 1}</td>
            <td>{item.name}</td>
            <td>{item.sortOrder}</td>
            <td>{item.active ? "Active" : "Inactive"}</td>
            <td>
              <button
                className="admin-itemtype-edit-btn"
                onClick={() => {
                  setEditingItem(item);
                  setFormData({
                    name: item.name,
                    sortOrder: item.sortOrder,
                    active: item.active,
                  });
                  setShowModal(true);
                }}
              >
                <Edit3 size={16} /> 
              </button>
              <button
                className="admin-itemtype-delete-btn"
                onClick={() =>
                  setDeletePopup({
                    show: true,
                    itemId: item.id,
                    itemName: item.name,
                    error: false,
                  })
                }
              >
                <Trash2 size={16} /> 
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>


      {/* Delete Popup */}
      {deletePopup.show && (
        <div className="admin-itemtype-popup-overlay">
          <div className="admin-itemtype-popup">
            {!deletePopup.error ? (
              <>
                <h3>Delete Item Type</h3>
                <p>
                  Are you sure you want to delete <strong>{deletePopup.itemName}</strong>?
                </p>
                <div className="admin-itemtype-btn-group">
                  <button
                    onClick={() => handleDeleteItem(deletePopup.itemId)}
                    className="admin-itemtype-delete-confirm-btn"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() =>
                      setDeletePopup({ show: false, itemId: null, itemName: "", error: false })
                    }
                    className="admin-itemtype-cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Cannot Delete Item Type</h3>
                <p>
                  <strong>{deletePopup.itemName}</strong> is used in menu and cannot be deleted.
                </p>
                <div className="admin-itemtype-btn-group">
                  <button
                    onClick={() =>
                      setDeletePopup({ show: false, itemId: null, itemName: "", error: false })
                    }
                    className="admin-itemtype-cancel-btn"
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
