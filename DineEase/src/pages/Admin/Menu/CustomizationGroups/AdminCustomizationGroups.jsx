import React, { useEffect, useState } from "react";
import { PlusSquare, Edit3, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminCustomizationGroups.css";

export default function AdminCustomizationGroups() {
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const BASE_URL =
    "http://localhost:8082/dine-ease/api/v1/menu/customization-group";

  const [organizationId, setOrganizationId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [expandedGroupIds, setExpandedGroupIds] = useState([]);

  // Popup states
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [deletePopup, setDeletePopup] = useState({
    show: false,
    groupId: null,
    groupName: "",
    error: false,
    backendMessage: "",
  });

  // Form Data
  const defaultForm = {
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
  };

  const [formData, setFormData] = useState(defaultForm);
  const [editingGroupId, setEditingGroupId] = useState(null);

  // Fetch profile → get organization ID
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Profile load failed");

        const data = await res.json();
        setOrganizationId(data.organizationId);

        fetchGroups(data.organizationId);
      } catch {
        toast.error("Error loading profile");
      }
    };

    fetchProfile();
  }, []);

  // Fetch customization groups
  const fetchGroups = async (orgId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/organization/${orgId}/active`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Failed to load groups");

      const data = await res.json();
      const groupsData = Array.isArray(data) ? data : data.content || [];

      setGroups(groupsData);
    } catch {
      toast.error("Error fetching groups");
    }
  };
  const toggleGroupOptions = (groupId) => {
    setExpandedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Option handlers
  const handleOptionChange = (index, field, value) => {
    const updated = [...formData.options];
    updated[index][field] = value;
    setFormData({ ...formData, options: updated });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [
        ...formData.options,
        {
          optionName: "",
          additionalPrice: 0,
          isDefault: false,
          isActive: true,
          displayOrder: 0,
        },
      ],
    });
  };

  const removeOption = (index) => {
    const updated = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: updated });
  };

  // Save / Update group
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!organizationId) {
      toast.error("Organization missing");
      return;
    }

    if (
      formData.isRequired &&
      !formData.options.some((opt) => opt.isDefault)
    ) {
      toast.error("Required group must have at least 1 default option");
      return;
    }

    const finalPayload = {
      organizationId,
      name: formData.name,
      description: formData.description,
      isRequired: formData.isRequired,
      selectionType: formData.selectionType,
      maxSelections:
        formData.selectionType === "SINGLE"
          ? 1
          : parseInt(formData.maxSelections, 10),
      isActive: formData.isActive,
      displayOrder: parseInt(formData.displayOrder || 0, 10),
      options: formData.options.map((o) => ({
        optionName: o.optionName,
        additionalPrice: parseFloat(o.additionalPrice),
        isDefault: o.isDefault,
        isActive: o.isActive,
        displayOrder: parseInt(o.displayOrder || 0, 10),
      })),
    };

    try {
      const token = localStorage.getItem("token");

      const url = isEditing
        ? `${BASE_URL}/${editingGroupId}`
        : BASE_URL;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalPayload),
      });

      if (!res.ok) throw new Error("Save failed");

      toast.success(isEditing ? "Group updated!" : "Group created!");

      setShowFormPopup(false);
      setFormData(defaultForm);
      setIsEditing(false);
      setEditingGroupId(null);

      fetchGroups(organizationId);
    } catch {
      toast.error("Error saving group");
    }
  };

  // Edit
  const openEditPopup = (group) => {
    setIsEditing(true);
    setEditingGroupId(group.id);

    setFormData({
      name: group.name || "",
      description: group.description || "",
      isRequired: group.isRequired,
      selectionType: group.selectionType,
      maxSelections: group.maxSelections,
      isActive: group.isActive,
      displayOrder: group.displayOrder || 0,
      options: group.options.map((opt) => ({
        optionName: opt.optionName || "",
        additionalPrice: opt.additionalPrice,
        isDefault: opt.isDefault,
        isActive: opt.isActive,
        displayOrder: opt.displayOrder || 0,
      })),
    });

    setShowFormPopup(true);
  };


  // Delete
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${BASE_URL}/${deletePopup.groupId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 409) {
        const errData = await res.json();
        setDeletePopup({
          ...deletePopup,
          error: true,
          backendMessage: errData.message,
        });
        return;
      }

      if (res.status === 200 || res.status === 204) {
        setDeletePopup({
          show: false,
          groupId: null,
          groupName: "",
          backendMessage: "",
          error: false,
        });
        toast.success("Deleted successfully!");
        fetchGroups(organizationId);
        return;
      }

      throw new Error("Delete failed");
    } catch {
      setDeletePopup({
        ...deletePopup,
        error: true,
        backendMessage: "Server error while deleting",
      });
    }
  };
  return (
    <div className="admin-customization-page">
      <div className="admin-customization-header-row">
        <h2>Customization Groups</h2>
        <button
          className="admin-customization-add-btn"
          onClick={() => {
            setFormData(defaultForm);
            setIsEditing(false);
            setShowFormPopup(true);
          }}
        >
          <PlusSquare size={18} /> Add Group
        </button>
      </div>

      <table className="admin-customization-table">
        <thead>
          <tr>
            
            <th>Group Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Status</th>
            <th>Options Count</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {groups.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No groups found
              </td>
            </tr>
          ) : (
            groups.map((g) => (
              <React.Fragment key={g.id}>
                <tr>
                  <td
                    style={{
                      cursor: "pointer",
                      color: "black",
                      fontWeight: "bold",
                      fontSize: "16px"
                    }}
                    onClick={() => toggleGroupOptions(g.id)}
                  >

                    {expandedGroupIds.includes(g.id) ? "v" : ">"} {g.name}
                  </td>
                  <td>{g.selectionType}</td>
                  <td>{g.isRequired ? "Yes" : "No"}</td>
                  <td>{g.isActive ? "Active" : "Inactive"}</td>
                  <td>{g.options?.length || 0}</td>
                  <td className="admin-customization-action-col">
                    <button
                      className="admin-customization-edit-btn"
                      onClick={() => openEditPopup(g)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="admin-customization-delete-btn"
                      onClick={() =>
                        setDeletePopup({
                          show: true,
                          groupId: g.id,
                          groupName: g.name,
                          error: false,
                          backendMessage: "",
                        })
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>

                {/* Expanded Options Table */}
                {expandedGroupIds.includes(g.id) && (
                  <tr>
                    <td colSpan="6" className="admin-customization-options-dropdown">
                      <table className="admin-customization-option-table">
                        <thead>
                          <tr>
                            <th>Option Name</th>
                            <th>Price</th>
                            <th>Default</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {g.options.map((opt) => (
                            <tr key={opt.id}>
                              <td>{opt.optionName}</td>
                              <td>{opt.priceDisplay || "Free"}</td>
                              <td>{opt.isDefault ? "Yes" : "No"}</td>
                              <td className="admin-customization-action-col">
                                {/* Edit Option */}
                                <button
                                  className="admin-customization-edit-btn"
                                  onClick={() => {
                                    setIsEditing(true);
                                    setEditingGroupId(g.id);
                                    setFormData({
                                      name: g.name,
                                      description: g.description,
                                      isRequired: g.isRequired,
                                      selectionType: g.selectionType,
                                      maxSelections: g.maxSelections,
                                      isActive: g.isActive,
                                      displayOrder: g.displayOrder || 0,
                                      options: g.options.map((o) => ({ ...o })),
                                    });
                                    setShowFormPopup(true);
                                  }}
                                >
                                  <Edit3 size={16} />
                                </button>

                                {/* Delete Option */}
                                <button
                                  className="admin-customization-delete-btn"
                                  onClick={async () => {
                                    try {
                                      const token = localStorage.getItem("token");
                                      const res = await fetch(
                                        `${BASE_URL}/${g.id}/options/${opt.id}`,
                                        {
                                          method: "DELETE",
                                          headers: { Authorization: `Bearer ${token}` },
                                        }
                                      );
                                      if (!res.ok) throw new Error("Delete failed");
                                      toast.success(
                                        `Deleted option: ${opt.optionName}`
                                      );
                                      fetchGroups(organizationId);
                                    } catch {
                                      toast.error("Error deleting option");
                                    }
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>



      {/* FORM POPUP */}
      {showFormPopup && (
        <div className="admin-customization-popup-overlay">
          <div className="admin-customization-popup-box admin-customization-large">
            <h3>{isEditing ? "Edit Group" : "Create Group"}</h3>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Group Name"
                className="admin-customization-input"
                value={formData.name}
                required
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <textarea
                placeholder="Description"
                className="admin-customization-textarea"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              ></textarea>

              <div className="admin-customization-row">
                <label>
                  Required{" "}
                  <input
                    type="checkbox"
                    checked={formData.isRequired}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isRequired: e.target.checked,
                      })
                    }
                  />
                </label>

                <label>
                  Active{" "}
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.checked,
                      })
                    }
                  />
                </label>
              </div>

              <select
                className="admin-customization-select"
                value={formData.selectionType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selectionType: e.target.value,
                  })
                }
              >
                <option value="SINGLE">Single Selection</option>
                <option value="MULTIPLE">Multiple Selection</option>
              </select>

              {formData.selectionType === "MULTIPLE" && (
                <input
                  type="number"
                  className="admin-customization-input-number"
                  placeholder="Max Selections"
                  value={formData.maxSelections}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxSelections: e.target.value,
                    })
                  }
                />
              )}

              {/* OPTIONS */}
              <h4 className="admin-customization-options-title">Options</h4>

              {formData.options.map((opt, index) => (
                <div key={index} className="admin-customization-option-row">
                  <input
                    type="text"
                    className="admin-customization-option-input"
                    placeholder="Option Name"
                    value={opt.optionName}
                    onChange={(e) =>
                      handleOptionChange(index, "optionName", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    placeholder="Price"
                    className="admin-customization-option-input"
                    value={opt.additionalPrice}
                    onChange={(e) =>
                      handleOptionChange(index, "additionalPrice", e.target.value)
                    }
                  />

                  <label className="admin-customization-option-label">
                    Default{" "}
                    <input
                      type="checkbox"
                      checked={opt.isDefault}
                      onChange={(e) =>
                        handleOptionChange(index, "isDefault", e.target.checked)
                      }
                    />
                  </label>

                  <button
                    type="button"
                    className="admin-customization-option-remove-btn"
                    onClick={() => removeOption(index)}
                  >
                    ❌
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="admin-customization-add-option-btn"
                onClick={addOption}
              >
                + Add Option
              </button>

              <div className="admin-customization-btn-row">
                <button type="submit" className="admin-customization-save-btn">
                  {isEditing ? "Update" : "Save"}
                </button>

                <button
                  type="button"
                  className="admin-customization-cancel-btn"
                  onClick={() => {
                    setShowFormPopup(false);
                    setIsEditing(false);
                    setFormData(defaultForm);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE POPUP */}
      {deletePopup.show && (
        <div className="admin-customization-popup-overlay">
          <div className="admin-customization-popup-box">
            <h3>
              {deletePopup.error
                ? "Cannot Delete Group"
                : "Delete Group"}
            </h3>

            {deletePopup.error ? (
              <p className="admin-customization-error-text">
                {deletePopup.backendMessage}
              </p>
            ) : (
              <p>
                Are you sure you want to delete{" "}
                <b>{deletePopup.groupName}</b>?
              </p>
            )}

            <div className="admin-customization-btn-row">
              {!deletePopup.error && (
                <button
                  className="admin-customization-delete-confirm-btn"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              )}

              <button
                className="admin-customization-cancel-btn"
                onClick={() =>
                  setDeletePopup({
                    show: false,
                    groupId: null,
                    groupName: "",
                    error: false,
                    backendMessage: "",
                  })
                }
              >
                {deletePopup.error ? "Close" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" />
    </div>
  );
}