import { useState, useEffect } from "react";
import "./AddonForm.css";

const API_BASE = "http://localhost:8082/dine-ease/api/v1";

const getToken = () => localStorage.getItem("token") || "";
const getOrgId = () => localStorage.getItem("organizationId") || "";

const safeJson = async (res) => {
  const txt = await res.text();
  try {
    return txt ? JSON.parse(txt) : {};
  } catch {
    return {};
  }
};

const createAddon = async (data) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/menu/addons/add`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  return safeJson(res);
};

const getAddons = async () => {
  const orgId = getOrgId();
  const token = getToken();

  const res = await fetch(
    `${API_BASE}/menu/addons/get-available?organizationId=${orgId}&isAvailable=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return safeJson(res);
};

const updateAddon = async (id, data) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/menu/addons/update/image?id=${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  return safeJson(res);
};

const deleteAddon = async (id) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/menu/addons/delete/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return safeJson(res);
};

// ----------------------------
// 🔥 EXAMPLE PLACEHOLDERS
// ----------------------------
const addonExamples = {
  SAUCE: "e.g., Ketchup, Mayo, Sriracha",
  TOPPING: "e.g., Cheese, Bacon, Avocado",
  SIDE: "e.g., Fries, Coleslaw, Onion Rings",
  BEVERAGE: "e.g., Coke, Iced Tea, Lemonade",
  EXTRA: "e.g., Extra Cheese, Extra Meat",
  SUBSTITUTION: "e.g., Gluten-Free Bun, Vegan Cheese",
  PROTEIN: "e.g., Chicken, Shrimp, Tofu",
  VEGETABLE: "e.g., Lettuce, Tomato, Peppers",
  CONDIMENT: "e.g., Pickles, Relish, Hot Sauce",
  SPICE: "e.g., Chili Powder, Paprika, Cumin",
  DIETARY: "e.g., Vegan Cheese, Keto Option",
  ALLERGY_FRIENDLY: "e.g., Nut-Free, Dairy-Free Option",
};

export default function AddonForm() {
  const [addons, setAddons] = useState([]);
  const [editId, setEditId] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [showAddons, setShowAddons] = useState(false);

  const [addon, setAddon] = useState({
    addOnName: "",
    addOnDescription: "",
    price: "",
    isAvailable: "true",
    addOnType: "SIDE",
  });

  const [image, setImage] = useState(null);

  const loadAddons = async () => {
    const list = await getAddons();

    const sortedList = Array.isArray(list)
      ? list.sort((a, b) => a.addOnId - b.addOnId)
      : [];

    setAddons(sortedList);
  };

  useEffect(() => {
    loadAddons();
  }, []);

  const handleChange = (e) =>
    setAddon({ ...addon, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const orgId = getOrgId();

    const formData = new FormData();
    formData.append("organizationId", orgId);
    formData.append("addOnName", addon.addOnName);
    formData.append("addOnDescription", addon.addOnDescription);
    formData.append("price", Number(addon.price));
    formData.append("isAvailable", addon.isAvailable);
    formData.append("addOnType", addon.addOnType.toUpperCase());
    if (image) formData.append("addOnImage", image);

    if (editId) {
      await updateAddon(editId, formData);
      alert("Add-on updated successfully!");
      setEditId(null);
    } else {
      await createAddon(formData);
      alert("Add-on added successfully!");
    }

    setAddon({
      addOnName: "",
      addOnDescription: "",
      price: "",
      isAvailable: "true",
      addOnType: "SIDE",
    });

    setImage(null);
    setShowPopup(false);
    loadAddons();
  };

  const handleEdit = (item) => {
    setEditId(item.addOnId);
    setAddon({
      addOnName: item.addOnName,
      addOnDescription: item.addOnDescription,
      price: item.price,
      isAvailable: item.isAvailable.toString(),
      addOnType: item.addOnType.toUpperCase(),
    });

    setShowPopup(true);
  };

  const handleDelete = async (id) => {
    await deleteAddon(id);
    alert("Add-on deleted successfully!");
    loadAddons();
  };

  const getImageType = (path) => {
    const ext = path.split(".").pop().toLowerCase();
    return ext === "png" ? "png" : "jpeg";
  };

  return (
    <div className="admin-container">
      {/* ================= TOP BUTTONS ================= */}
      <div style={{ marginBottom: "20px" }}>
        <button
          className="add-btn"
          onClick={() => {
            setShowPopup(true);
            setEditId(null);
          }}
        >
          ➕ Add Add-on
        </button>

        <button className="view-btn" onClick={() => setShowAddons(!showAddons)}>
          {showAddons ? "👁️ Hide Add-ons" : "👁️ View Add-ons"}
        </button>
      </div>

      {/* ================= TABLE ================= */}
      {showAddons && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>SL.No</th>
              <th>Name</th>
              <th>Type</th>
              <th>Price</th>
              <th>Available</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {addons.map((item) => (
              <tr key={item.addOnId}>
                <td>{item.addOnId}</td>
                <td>{item.addOnName}</td>
                <td>{item.addOnType}</td>
                <td>₹{item.price}</td>
                <td>{item.isAvailable ? "Yes" : "No"}</td>
                <td>
                  {item.addOnImageData ? (
                    <img
                      src={`data:image/${getImageType(
                        item.addOnImage
                      )};base64,${item.addOnImageData}`}
                      alt={item.addOnName}
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>

                <td>
                  <button className="edit-btn" onClick={() => handleEdit(item)}>
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.addOnId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= POPUP FORM ================= */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>{editId ? "Update Add-on" : "Add New Add-on"}</h3>

            <form onSubmit={handleSubmit}>
              {/* Addon Name */}
              <input
                name="addOnName"
                placeholder={
                  addonExamples[addon.addOnType] || "Add-on Name"
                }
                value={addon.addOnName}
                onChange={handleChange}
                required
              />

              {/* Description */}
              <textarea
                name="addOnDescription"
                placeholder="Description"
                value={addon.addOnDescription}
                onChange={handleChange}
                required
              />

              {/* Price */}
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={addon.price}
                onChange={handleChange}
                required
              />

              {/* Type */}
              <select
                name="addOnType"
                value={addon.addOnType}
                onChange={handleChange}
              >
                <option value="">Select Type</option>
                {Object.keys(addonExamples).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* Availability */}
              <select
                name="isAvailable"
                value={addon.isAvailable}
                onChange={handleChange}
              >
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>

              {/* Image */}
              <input type="file" onChange={(e) => setImage(e.target.files[0])} />

              {/* Buttons */}
              <div className="popup-buttons">
                <button type="submit" className="save-btn">
                  {editId ? "Update" : "Save"}
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowPopup(false);
                    setEditId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
