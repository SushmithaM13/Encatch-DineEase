import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminCustomizationGroups.css";

export default function AdminCustomizationGroups() {
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const BASE_URL = "http://localhost:8082/dine-ease/api/v1/menu/customization-group";

  const [organizationId, setOrganizationId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isRequired: true,
    selectionType: "SINGLE",
    maxSelections: 1,
    isActive: true,
    displayOrder: 0,
    options: [
      {
        optionName: "",
        additionalPrice: 0,
        isDefault: false,
        isActive: true,
        displayOrder: 0,
      },
    ],
  });
  const [editingGroup, setEditingGroup] = useState(null);

  // ✅ Fetch profile to get organization ID
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

        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setOrganizationId(data.organizationId);
        fetchGroups(data.organizationId);
      } catch (err) {
        toast.error("Failed to fetch profile!");
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Fetch customization groups
  const fetchGroups = async (orgId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/organization/${orgId}/active`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Failed to fetch groups");

      const data = await res.json();

      // ✅ Handle both array and paginated formats
      const groupsData = Array.isArray(data) ? data : data.content || [];
      setGroups(groupsData);
    } catch (err) {
      toast.error("Error loading customization groups!");
      console.error(err);
    }
  };


  // ✅ Handle option change
  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index][field] = value;
    setFormData({ ...formData, options: updatedOptions });
  };

  // ✅ Add and remove option rows
  const addOption = () => {
    setFormData({
      ...formData,
      options: [
        ...formData.options,
        { optionName: "", additionalPrice: 0, isDefault: false, isActive: true, displayOrder: 0 },
      ],
    });
  };

  const removeOption = (index) => {
    const updated = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: updated });
  };

  // ✅ Submit form (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!organizationId) {
      toast.error("Organization ID missing");
      return;
    }

    // ✅ Validation: required group must have at least one default option
    if (formData.isRequired && !formData.options.some((opt) => opt.isDefault)) {
      toast.error("At least one option must be marked as default for a required group!");
      return;
    }

    // ✅ Auto-correct rule: SINGLE type must have maxSelections = 1
    let adjustedMaxSelections = formData.maxSelections;
    if (formData.selectionType === "SINGLE") {
      adjustedMaxSelections = 1;
    }

    const token = localStorage.getItem("token");

    const payload = {
      organizationId,
      name: formData.name,
      description: formData.description,
      isRequired: formData.isRequired,
      selectionType: formData.selectionType,
      maxSelections: parseInt(adjustedMaxSelections, 10),
      isActive: formData.isActive,
      displayOrder: parseInt(formData.displayOrder, 10),
      options: formData.options.map((opt) => ({
        optionName: opt.optionName,
        additionalPrice: parseFloat(opt.additionalPrice || 0),
        isDefault: opt.isDefault,
        isActive: opt.isActive,
        displayOrder: parseInt(opt.displayOrder || 0, 10),
      })),
    };


    try {
      const url = editingGroup ? `${BASE_URL}/${editingGroup.id}` : BASE_URL;
      const method = editingGroup ? "PUT" : "POST";

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
        throw new Error(`Failed: ${errorText}`);
      }

      toast.success(editingGroup ? "Group updated successfully!" : "Group created successfully!");
      setFormData({
        name: "",
        description: "",
        isRequired: true,
        selectionType: "SINGLE",
        maxSelections: 1,
        isActive: true,
        displayOrder: 0,
        options: [
          {
            optionName: "",
            additionalPrice: 0,
            isDefault: false,
            isActive: true,
            displayOrder: 0,
          },
        ],
      });
      setEditingGroup(null);
      fetchGroups(organizationId);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Error saving group!");
    }
  };
  // ✅ Handle Edit

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      isRequired: group.isRequired,
      selectionType: group.selectionType,
      maxSelections: group.maxSelections,
      isActive: group.isActive,
      displayOrder: group.displayOrder,
      options: group.options || [],
    });
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setFormData({
      name: "",
      description: "",
      isRequired: true,
      selectionType: "SINGLE",
      maxSelections: 1,
      isActive: true,
      displayOrder: 0,
      options: [
        { optionName: "", additionalPrice: 0, isDefault: false, isActive: true, displayOrder: 0 },
      ],
    });
  };

  return (
    <div className="admin-customize-page">
      <h2 className="admin-customize-title">Customization Groups</h2>

      <form onSubmit={handleSubmit} className="admin-customize-form">
        <input
          type="text"
          placeholder="Group Name"
          className="admin-customize-input"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <textarea
          placeholder="Description"
          className="admin-customize-textarea"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="admin-customize-row">
          <label>
            Required:
            <input
              type="checkbox"
              checked={formData.isRequired}
              onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
            />
          </label>
          <label>
            Active:
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
          </label>
        </div>

        <select
          className="admin-customize-select"
          value={formData.selectionType}
          onChange={(e) => setFormData({ ...formData, selectionType: e.target.value })}
        >
          <option value="SINGLE">Single Selection</option>
          <option value="MULTIPLE">Multiple Selection</option>
        </select>

        <input
          type="number"
          placeholder="Max Selections"
          className="admin-customize-input-number"
          value={formData.maxSelections}
          onChange={(e) => setFormData({ ...formData, maxSelections: e.target.value })}
        />

        <h4 className="admin-customize-subtitle">Options</h4>
        {formData.options.map((option, index) => (
          <div key={index} className="admin-customize-option-row">
            <input
              type="text"
              placeholder="Option Name"
              className="admin-customize-option-input"
              value={option.optionName}
              onChange={(e) => handleOptionChange(index, "optionName", e.target.value)}
            />
            <input
              type="number"
              placeholder="Additional Price"
              className="admin-customize-option-input"
              value={option.additionalPrice}
              onChange={(e) => handleOptionChange(index, "additionalPrice", e.target.value)}
            />
            <label className="admin-customize-option-label">
              Default:
              <input
                type="checkbox"
                checked={option.isDefault}
                onChange={(e) => handleOptionChange(index, "isDefault", e.target.checked)}
              />
            </label>
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="admin-customize-remove-option-btn"
            >
              ❌
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addOption}
          className="admin-customize-add-option-btn"
        >
          + Add Option
        </button>

        <div className="admin-customize-btn-row">
          <button type="submit" className="admin-customize-submit-btn">
            {editingGroup ? "Update Group" : "Create Group"}
          </button>
          {editingGroup && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="admin-customize-cancel-btn"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="admin-customize-list-title">Existing Groups</h3>
      <div className="admin-customize-group-list">
        {groups.length === 0 ? (
          <p>No customization groups found.</p>
        ) : (
          groups.map((g) => (
            <div key={g.id} className="admin-customize-group-card">
              <h4 className="admin-customize-group-name">{g.name}</h4>
              <p className="admin-customize-group-desc">{g.description}</p>
              <p className="admin-customize-group-type">
                Type: {g.selectionType}
              </p>
              <p className="admin-customize-group-status">
                Status: {g.isActive ? "Active" : "Inactive"}
              </p>
              <button
                className="admin-customize-edit-btn"
                onClick={() => handleEdit(g)}
              >
                Edit
              </button>
            </div>
          ))
        )}
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
}
