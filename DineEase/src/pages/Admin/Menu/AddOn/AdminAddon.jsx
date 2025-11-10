import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminAddon.css";

export default function AdminAddon() {
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const BASE_URL = "http://localhost:8082/dine-ease/api/v1/menu/addons";

  const [organizationId, setOrganizationId] = useState(null);
  const [formData, setFormData] = useState({
    organizationId: "",
    addOnName: "",
    addOnDescription: "",
    price: "",
    isAvailable: true,
    addOnType: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [addons, setAddons] = useState([]);
  const [editingAddon, setEditingAddon] = useState(null);
  const [showModal, setShowModal] = useState(false);


  // ✅ Fetch organization ID from profile
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
        const orgId = data.organizationId;
        setOrganizationId(orgId);
        fetchAddons(orgId); // ✅ Fetch add-ons once orgId is available
      } catch (err) {
        toast.error("Profile fetch failed!");
        console.error(err);
      }
    };

    fetchProfile();
  }, []);



  // ✅ Fetch Add-Ons
  const fetchAddons = async (orgId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        toast.error("Unauthorized — please re-login.");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch add-ons");
      const data = await res.json();
      setAddons(data);
    } catch (err) {
      toast.error("Add-on fetch failed!");
      console.error(err);
    }
  };


  // ✅ Add or Update Add-On
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!organizationId) {
      toast.error("Organization ID missing");
      return;
    }

    if (!editingAddon && !imageFile) {
      toast.error("Please upload an image for the add-on");
      return;
    }

    const data = new FormData();
    data.append("organizationId", organizationId);
    data.append("addOnName", formData.addOnName);
    data.append("addOnDescription", formData.addOnDescription);
    data.append("price", formData.price);
    data.append("isAvailable", formData.isAvailable);
    data.append("addOnType", formData.addOnType);
    if (imageFile) data.append("addOnImage", imageFile);

    console.log("Submitting addon:", Object.fromEntries(data.entries()));

    try {
      const url = editingAddon
        ? `${BASE_URL}/update/details/${editingAddon.id}`
        : `${BASE_URL}/add`;
      const method = editingAddon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: data,
      });

      if (res.ok) {
        toast.success(
          editingAddon ? "Add-on updated successfully!" : "Add-on added successfully!"
        );
        handleCancelEdit();
        fetchAddons(organizationId);
        setShowModal(false);
      } else {
        const errText = await res.text();
        console.error("Backend error:", errText);
        toast.error("Failed to save add-on");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving add-on");
    }
  };


  // ✅ Handle Edit
  const handleEdit = (addon) => {
    setEditingAddon(addon);
    setFormData({
      organizationId,
      addOnName: addon.addOnName,
      addOnDescription: addon.addOnDescription,
      price: addon.price,
      isAvailable: addon.isAvailable,
      addOnType: addon.addOnType,
    });
    setImageFile(null);
  };

  // ✅ Cancel Edit
  const handleCancelEdit = () => {
    setEditingAddon(null);
    setFormData({
      organizationId,
      addOnName: "",
      addOnDescription: "",
      price: "",
      isAvailable: true,
      addOnType: "",
    });
    setImageFile(null);
  };

  return (
    <div className="admin-addons-page">
      <div className="admin-addons-header">
        <h2 className="admin-addons-title">Add-On Management</h2>
        <button className="admin-addons-add-btn" onClick={() => setShowModal(true)}>
          + Add Addon
        </button>
      </div>


      {/* ====== Add / Edit Form ====== */}
      {showModal && (
        <div className="admin-addons-modal-overlay">
          <div className="admin-addons-modal">
            <h3>{editingAddon ? "Edit Add-On" : "Add New Add-On"}</h3>

            <form onSubmit={handleSubmit} className="admin-addons-form">
              <input
                type="text"
                placeholder="Add-On Name"
                className="admin-addons-input"
                value={formData.addOnName}
                onChange={(e) =>
                  setFormData({ ...formData, addOnName: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Description"
                className="admin-addons-textarea"
                value={formData.addOnDescription}
                onChange={(e) =>
                  setFormData({ ...formData, addOnDescription: e.target.value })
                }
              ></textarea>
              <input
                type="number"
                placeholder="Price"
                className="admin-addons-input"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
              <select
                className="admin-addons-select"
                value={formData.isAvailable}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isAvailable: e.target.value === "true",
                  })
                }
              >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
              <select
                className="admin-addons-input"
                value={formData.addOnType}
                onChange={(e) =>
                  setFormData({ ...formData, addOnType: e.target.value })
                }
                required
              >
                <option value="">Select Add-On Type</option>
                <option value="TOPPING">Topping</option>
                <option value="SAUCE">Sauce</option>
                <option value="EXTRA_CHEESE">Extra Cheese</option>
                <option value="DRINK">Drink</option>
              </select>

              <input
                type="file"
                className="admin-addons-file"
                onChange={(e) => setImageFile(e.target.files[0])}
                accept="image/*"
                required={!editingAddon}
              />

              <div className="admin-addons-btn-group">
                <button type="submit" className="admin-addons-submit-btn">
                  {editingAddon ? "Update Add-On" : "Add Add-On"}
                </button>
                <button
                  type="button"
                  className="admin-addons-cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    handleCancelEdit();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ====== List Section ====== */}
      <h3 className="admin-addons-subtitle">Available Add-Ons</h3>
      <div className="admin-addons-list">
        {addons.length === 0 ? (
          <p className="admin-addons-empty">No add-ons found.</p>
        ) : (
          addons.map((addon, index) => (
            <div key={addon.id || index} className="admin-addons-card">
              {addon.addOnImageData ? (
                <img
                  src={`data:image/jpeg;base64,${addon.addOnImageData}`}
                  alt={addon.addOnName}
                  className="admin-addons-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/no-image.png";
                  }}
                />
              ) : (
                <div className="no-img">No Image</div>
              )}


              <div className="admin-addons-info">
                <h4 className="admin-addons-name">{addon.addOnName}</h4>
                <p className="admin-addons-description">
                  {addon.addOnDescription}
                </p>
                <p className="admin-addons-price">₹{addon.price}</p>
                <p className="admin-addons-type">Type: {addon.addOnType}</p>
                <p
                  className={
                    addon.isAvailable
                      ? "admin-addons-status available"
                      : "admin-addons-status unavailable"
                  }
                >
                  {addon.isAvailable ? "Available" : "Unavailable"}
                </p>
                <button
                  className="admin-addons-edit-btn"
                  onClick={() => handleEdit(addon)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
}
// addons