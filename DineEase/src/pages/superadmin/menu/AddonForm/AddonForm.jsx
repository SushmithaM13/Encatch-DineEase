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

  // Sort by addOnId ascending
  const sortedList = Array.isArray(list)
    ? list.sort((a, b) => a.addOnId - b.addOnId)
    : [];

  setAddons(sortedList);
};


  useEffect(() => {
    loadAddons();
  }, []);

  const handleChange = (e) => {
    setAddon({ ...addon, [e.target.name]: e.target.value });
  };

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
    alert("Add-on delete successfully!");
    loadAddons();
  };

  const getImageType = (path) => {
    const ext = path.split(".").pop().toLowerCase();
    return ext === "png" ? "png" : "jpeg";
  };

  return (
    <div className="admin-container">

      {/* TOP BUTTONS */}
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

        <button
          className="view-btn"
          onClick={() => setShowAddons(!showAddons)}
        >
          {showAddons ? "👁️ Hide Add-ons" : "👁️ View Add-ons"}
        </button>
      </div>

      {/* TABLE ONLY WHEN showAddons = true */}
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

      {/* POPUP FORM */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>{editId ? "Update Add-on" : "Add New Add-on"}</h3>

            <form onSubmit={handleSubmit}>
              <input
                name="addOnName"
                placeholder="Addon Name"
                value={addon.addOnName}
                onChange={handleChange}
                required
              />

              <textarea
                name="addOnDescription"
                placeholder="Description"
                value={addon.addOnDescription}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={addon.price}
                onChange={handleChange}
                required
              />

              <select
                name="addOnType"
                value={addon.addOnType}
                onChange={handleChange}
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

              <select
                name="isAvailable"
                value={addon.isAvailable}
                onChange={handleChange}
              >
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>

              <input type="file" onChange={(e) => setImage(e.target.files[0])} />

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
