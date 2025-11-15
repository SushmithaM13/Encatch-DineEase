import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Trash2, Edit3 } from "lucide-react";
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
  const [deleteAddonPopup, setDeleteAddonPopup] = useState({
    show: false,
    addonId: null,
    addonName: "",
    error: false,
  });

  // Fetch organization ID
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("No token found. Please login.");

        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        const orgId =
          data.organizationId || data.organization?.organizationId || data.organization?.id;
        if (!orgId) return toast.error("Organization ID missing!");

        setOrganizationId(orgId);
        fetchAddons(orgId);
      } catch (err) {
        console.error(err);
        toast.error("Profile fetch failed!");
      }
    };
    fetchProfile();
  }, []);

  // Fetch add-ons
  const fetchAddons = async (orgId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch add-ons");

      const data = await res.json();
      setAddons(data);
    } catch (err) {
      console.error(err);
      toast.error("Add-on fetch failed!");
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.addOnName.trim()) return toast.warning("Add-On Name required!");
  if (!editingAddon && !imageFile) return toast.warning("Please upload an image!");
  if (!formData.price) return toast.warning("Price is required!");

  try {
    const token = localStorage.getItem("token");
    const addOnId = editingAddon?.id || editingAddon?.addOnId;
    const url = editingAddon ? `${BASE_URL}/update/details/${addOnId}` : `${BASE_URL}/add`;
    const method = editingAddon ? "PUT" : "POST";

    let body;
    let headers = { Authorization: `Bearer ${token}` };

    if (editingAddon) {
      // Send JSON for update
      body = {
        organizationId,
        addOnName: formData.addOnName,
        addOnDescription: formData.addOnDescription,
        price: parseFloat(formData.price).toFixed(2),
        isAvailable: formData.isAvailable,
        addOnType: formData.addOnType,
        addOnImageBase64: imageFile
          ? await toBase64(imageFile)
          : editingAddon.addOnImageData || null,
      };
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    } else {
      // Send FormData for create
      body = new FormData();
      body.append("organizationId", organizationId.toString());
      body.append("addOnName", formData.addOnName);
      body.append("addOnDescription", formData.addOnDescription);
      body.append("price", parseFloat(formData.price).toFixed(2));
      body.append("isAvailable", formData.isAvailable.toString());
      body.append("addOnType", formData.addOnType);
      if (imageFile) body.append("addOnImage", imageFile);
    }

    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(errorText);
      throw new Error("Failed to save add-on");
    }

    toast.success(editingAddon ? "Updated successfully!" : "Added successfully!");
    handleCancelEdit();
    fetchAddons(organizationId);
    setShowModal(false);
  } catch (err) {
    console.error(err);
    toast.error("Error saving add-on");
  }
};

// Helper to convert file to base64
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]); // remove prefix
    reader.onerror = (error) => reject(error);
  });


  // Edit add-on
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
    setShowModal(true);
  };

  // Delete add-on
  const handleDeleteAddon = async (addonId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/delete/${addonId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 409) {
        setDeleteAddonPopup((prev) => ({ ...prev, show: true, error: true }));
        return;
      }
      if (!res.ok) throw new Error("Failed to delete add-on");

      fetchAddons(organizationId);
      setDeleteAddonPopup({ show: false, addonId: null, addonName: "", error: false });
    } catch (err) {
      console.error(err);
      setDeleteAddonPopup({ show: true, addonId, addonName: "", error: true });
    }
  };

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
      <ToastContainer position="top-center" />

      <div className="admin-addons-header">
        <h2>Add-On Management</h2>
        <button onClick={() => setShowModal(true)}>+ Add Add-On</button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="admin-addons-modal-overlay">
          <div className="admin-addons-modal">
            <h3>{editingAddon ? "Edit Add-On" : "Add New Add-On"}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Add-On Name"
                value={formData.addOnName}
                onChange={(e) => setFormData({ ...formData, addOnName: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.addOnDescription}
                onChange={(e) => setFormData({ ...formData, addOnDescription: e.target.value })}
              />
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <select
                value={formData.isAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.value === "true" })
                }
              >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
              <select
                value={formData.addOnType}
                onChange={(e) => setFormData({ ...formData, addOnType: e.target.value })}
                required
              >
                <option value="">Select Type</option>
                <option value="SAUCE">Sauce</option>
                <option value="TOPPING">Topping</option>
                <option value="SIDE">Side</option>
                <option value="BEVERAGE">Beverage</option>
                <option value="EXTRA">Extra</option>
                <option value="SUBSTITUTION">Substitution</option>
                <option value="PROTEIN">Protein</option>
                <option value="VEGETABLE">Vegetable</option>
                <option value="CONDIMENT">Condiment</option>
                <option value="SPICE">Spice</option>
                <option value="DIETARY">Dietary</option>
                <option value="ALLERGY_FRIENDLY">Allergy Friendly</option>
              </select>

              

              <input
                type="file"
                onChange={(e) => setImageFile(e.target.files[0])}
                accept="image/*"
                required={!editingAddon}
              />

              <div className="admin-addons-btn-group">
                <button type="submit">{editingAddon ? "Update" : "Add"}</button>
                <button type="button" onClick={() => { setShowModal(false); handleCancelEdit(); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <h3>Available Add-Ons</h3>
      <table className="admin-addons-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {addons.length === 0 ? (
            <tr>
              <td colSpan="8">No add-ons found.</td>
            </tr>
          ) : (
            addons.map((addon, index) => (
              <tr key={addon.id || index}>
                <td>{index + 1}</td>
                <td>
                  {addon.addOnImageData ? (
                    <img
                      src={`data:image/jpeg;base64,${addon.addOnImageData}`}
                      alt={addon.addOnName}
                      className="addon-img"
                      onError={(e) => (e.target.src = "/no-image.png")}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>{addon.addOnName}</td>
                <td>{addon.addOnDescription}</td>
                <td>₹{addon.price}</td>
                <td>{addon.addOnType}</td>
                <td>{addon.isAvailable ? "Available" : "Unavailable"}</td>
                <td>
                  <button onClick={() => handleEdit(addon)}>
                    <Edit3 size={16} />{" "}
                  </button>
                  <button
                    onClick={() =>
                      setDeleteAddonPopup({
                        show: true,
                        addonId: addon.id,
                        addonName: addon.addOnName,
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

      {/* Delete Popup */}
      {deleteAddonPopup.show && (
        <div className="admin-addons-modal-overlay">
          <div className="admin-addons-modal">
            {!deleteAddonPopup.error ? (
              <>
                <h3>Delete Add-On</h3>
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{deleteAddonPopup.addonName}</strong>?
                </p>
                <div className="admin-addons-btn-group">
                  <button
                    onClick={() => handleDeleteAddon(deleteAddonPopup.addonId)}
                    className="admin-addons-delete-confirm-btn"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() =>
                      setDeleteAddonPopup({ show: false, addonId: null, addonName: "", error: false })
                    }
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Cannot Delete Add-On</h3>
                <p>
                  <strong>{deleteAddonPopup.addonName}</strong> cannot be deleted
                  because it is used in menu.
                </p>
                <div className="admin-addons-btn-group">
                  <button
                    onClick={() =>
                      setDeleteAddonPopup({ show: false, addonId: null, addonName: "", error: false })
                    }
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
