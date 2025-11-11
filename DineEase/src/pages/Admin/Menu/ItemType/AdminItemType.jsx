import React, { useEffect, useState } from "react";
import { PlusCircle, Edit3, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminItemType.css";

export default function AdminItemType() {
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const ITEM_TYPE_API = "http://localhost:8082/dine-ease/api/v1/menu/item-types";

  const [organizationId, setOrganizationId] = useState(null);
  const [itemTypes, setItemTypes] = useState([]);
  const [newItemType, setNewItemType] = useState({ name: "", sortOrder: 0, active: true });
  const [editItem, setEditItem] = useState(null);
  // const [deleteItem, setDeleteItem] = useState(null);

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
          // window.location.href = "/login"; // Uncomment if routing enabled
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

  // ✅ Fetch item types
  useEffect(() => {
    if (!organizationId) return;

    const fetchItemTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${ITEM_TYPE_API}?organizationId=${organizationId}&active=true`, {
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

    fetchItemTypes();
  }, [organizationId]);

  // ✅ Add new item type
  const handleAddItemType = async () => {
    if (!newItemType.name.trim()) return toast.warning("Name is required");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(ITEM_TYPE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newItemType, organizationId }),
      });

      if (!res.ok) throw new Error("Failed to add item type");

      toast.success("Item type added successfully!");
      setNewItemType({ name: "", sortOrder: 0, active: true });

      const data = await fetch(`${ITEM_TYPE_API}?organizationId=${organizationId}&active=true`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      setItemTypes(data);
    } catch (err) {
      toast.error("Add failed!");
      console.error(err);
    }
  };

  // ✅ Update item type
  const handleUpdateItemType = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${ITEM_TYPE_API}/${editItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editItem.name,
          sortOrder: editItem.sortOrder,
          active: editItem.active,
        }),
      });

      if (!res.ok) throw new Error("Failed to update item type");

      toast.success("Item type updated!");
      setEditItem(null);

      const data = await fetch(`${ITEM_TYPE_API}?organizationId=${organizationId}&active=true`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      setItemTypes(data);
    } catch (err) {
      toast.error("Update failed!");
      console.error(err);
    }
  };

  // // ✅ Delete item type (simulated until backend DELETE API ready)
  // const handleDeleteItemType = async () => {
  //   try {
  //     const token = localStorage.getItem("token");

  //     // Uncomment below when backend DELETE API is implemented
  //     /*
  //     const res = await fetch(`${ITEM_TYPE_API}/${deleteItem.id}`, {
  //       method: "DELETE",
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     if (!res.ok) throw new Error("Failed to delete item type");
  //     */

  //     toast.info(`(Simulated) Deleted "${deleteItem.name}"`);
  //     setItemTypes((prev) => prev.filter((item) => item.id !== deleteItem.id));
  //     setDeleteItem(null);
  //   } catch (err) {
  //     toast.error("Delete failed!");
  //     console.error(err);
  //   }
  // };

  return (
    <div className="admin-item-container">
      <ToastContainer />
      <h2 className="admin-item-title">Item Types</h2>

      {/* ➕ Add Item Type */}
      <div className="admin-item-add-section">
        <h3 className="admin-item-add-heading">Add Item Type</h3>
        <div className="admin-item-add-form">
          <input
            type="text"
            className="admin-item-input"
            placeholder="Enter name"
            value={newItemType.name}
            onChange={(e) => setNewItemType({ ...newItemType, name: e.target.value })}
          />
          <input
            type="number"
            className="admin-item-input small"
            placeholder="Sort Order"
            value={newItemType.sortOrder}
            onChange={(e) => setNewItemType({ ...newItemType, sortOrder: +e.target.value })}
          />
          <button onClick={handleAddItemType} className="admin-item-add-btn">
            <PlusCircle size={18} /> Add
          </button>
        </div>
      </div>

      {/* 📋 List */}
      <div className="admin-item-list-section">
        <h3 className="admin-item-list-heading">Existing Item Types</h3>
        {itemTypes.length === 0 ? (
          <p className="admin-item-empty">No item types found.</p>
        ) : (
          <table className="admin-item-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Sort Order</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {itemTypes.map((type) => (
                <tr key={type.id}>
                  <td>{type.name}</td>
                  <td>{type.sortOrder}</td>
                  <td>{type.active ? "Yes" : "No"}</td>
                  <td className="admin-item-actions">
                    <button onClick={() => setEditItem(type)} className="admin-item-edit-btn">
                      <Edit3 size={18} />
                    </button>
                    {/* <button onClick={() => setDeleteItem(type)} className="admin-item-delete-btn">
                      <Trash2 size={18} />
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ✏️ Edit Popup */}
      {editItem && (
        <div className="admin-item-popup-overlay">
          <div className="admin-item-popup">
            <h3 className="admin-item-popup-title">Edit Item Type</h3>
            <input
              type="text"
              className="admin-item-popup-input"
              value={editItem.name}
              onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
            />
            <input
              type="number"
              className="admin-item-popup-input"
              value={editItem.sortOrder}
              onChange={(e) => setEditItem({ ...editItem, sortOrder: +e.target.value })}
            />
            <div className="admin-item-popup-actions">
              <button onClick={handleUpdateItemType} className="admin-item-update-btn">
                Update
              </button>
              <button onClick={() => setEditItem(null)} className="admin-item-cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ Delete Confirmation Popup
      {deleteItem && (
        <div className="admin-item-popup-overlay">
          <div className="admin-item-popup">
            <h3 className="admin-item-popup-title">Confirm Delete</h3>
            <p className="admin-item-delete-msg">
              Are you sure you want to delete <strong>{deleteItem.name}</strong>?
            </p>
            <div className="admin-item-popup-actions">
              <button onClick={handleDeleteItemType} className="admin-item-delete-confirm-btn">
                Yes, Delete
              </button>
              <button onClick={() => setDeleteItem(null)} className="admin-item-cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
