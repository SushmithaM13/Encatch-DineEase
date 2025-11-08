import { useState } from "react";

// ✅ Helper
const getOrgId = () => localStorage.getItem("organizationId") || "";
const withOrg = (data) => ({ ...data, organizationId: getOrgId() });
const API_BASE = "http://localhost:8082/dine-ease/api/v1";

// ✅ API: Create Variant
const createVariant = async (data) => {
  const res = await fetch(`${API_BASE}/variant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withOrg(data)),
  });
  return res.json();
};

// ✅ Component
export default function VariantForm() {
  const [variant, setVariant] = useState({
    variantName: "",
    price: 0,
    discountPrice: 0,
  });

  const handleChange = (e) =>
    setVariant({ ...variant, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createVariant(variant);
    setVariant({ variantName: "", price: 0, discountPrice: 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="admin-card">
      <h3>Add Variant</h3>
      <input name="variantName" placeholder="Variant Name" value={variant.variantName} onChange={handleChange} />
      <input name="price" type="number" placeholder="Price" value={variant.price} onChange={handleChange} />
      <input name="discountPrice" type="number" placeholder="Discount" value={variant.discountPrice} onChange={handleChange} />
      <button type="submit">Save</button>
    </form>
  );
}
