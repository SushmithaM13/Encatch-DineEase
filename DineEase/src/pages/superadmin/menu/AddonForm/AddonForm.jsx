import { useState } from "react";
import "./AddonForm.css";

// ✅ Helper
const getOrgId = () => localStorage.getItem("organizationId") || "";
const withOrg = (data) => ({ ...data, organizationId: getOrgId() });
const API_BASE = "http://localhost:8082/dine-ease/api/v1";

// ✅ API: Create Addon
const createAddon = async (data) => {
  const res = await fetch(`${API_BASE}/addon`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withOrg(data)),
  });
  return res.json();
};

// ✅ Component
export default function AddonForm() {
  const [addon, setAddon] = useState({ name: "", description: "", price: 0 });

  const handleChange = (e) =>
    setAddon({ ...addon, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAddon(addon);
    setAddon({ name: "", description: "", price: 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="admin-card">
      <h3>Add Add-on</h3>
      <input name="name" placeholder="Add-on Name" value={addon.name} onChange={handleChange} />
      <textarea name="description" placeholder="Description" value={addon.description} onChange={handleChange} />
      <input name="price" type="number" placeholder="Price" value={addon.price} onChange={handleChange} />
      <button type="submit">Save</button>
    </form>
  );
}
