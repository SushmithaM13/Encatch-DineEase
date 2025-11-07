import { useState } from "react";
import { toast } from "react-toastify";
//import "../../styles/MenuPage.css";

// ✅ Helper
const getOrgId = () => localStorage.getItem("organizationId") || "";
const withOrg = (data) => ({ ...data, organizationId: getOrgId() });
const API_BASE = "http://localhost:8082/dine-ease/api/v1";

// ✅ APIs
const createCustomizationGroup = async (data) => {
  const res = await fetch(`${API_BASE}/customizationGroup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withOrg(data)),
  });
  return res.json();
};

const addCustomizationOption = async (groupId, optionData) => {
  const res = await fetch(`${API_BASE}/customizationGroup/${groupId}/option`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withOrg(optionData)),
  });
  return res.json();
};

// ✅ Component
export default function CustomizationGroupForm() {
  const [groupName, setGroupName] = useState("");
  const [options, setOptions] = useState([{ name: "", price: "" }]);
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { name: "", price: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const groupRes = await createCustomizationGroup({ name: groupName });
      if (groupRes?.id) {
        for (const opt of options) {
          await addCustomizationOption(groupRes.id, opt);
        }
        toast.success("Customization group added successfully!");
        setGroupName("");
        setOptions([{ name: "", price: "" }]);
      } else {
        toast.error("Failed to create group.");
      }
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="menu-card">
      <h3>Add Customization Group</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Group Name (e.g. Spice Level)"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
        />
        <h4>Options</h4>
        {options.map((opt, index) => (
          <div key={index} className="option-row">
            <input
              type="text"
              placeholder="Option Name"
              value={opt.name}
              onChange={(e) => handleOptionChange(index, "name", e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={opt.price}
              onChange={(e) => handleOptionChange(index, "price", e.target.value)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addOption} className="secondary-btn">
          + Add Option
        </button>
        <button type="submit" disabled={loading} className="primary-btn">
          {loading ? "Saving..." : "Save Group"}
        </button>
      </form>
    </div>
  );
}
