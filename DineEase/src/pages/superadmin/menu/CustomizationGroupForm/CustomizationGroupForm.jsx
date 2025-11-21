import React, { useState, useEffect } from "react";
import "./CustomizationGroupForm.css";

const API_BASE = "http://localhost:8082/dine-ease/api/v1";
const getOrgId = () => localStorage.getItem("organizationId") || "";
const getToken = () => localStorage.getItem("token") || "";

// SAFE JSON PARSE
const safeJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

// BASE FETCH HANDLER
const apiFetch = async (url, method = "GET", body = null) => {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };

  if (body && !(body instanceof FormData)) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    opts.body = body;
  }

  const res = await fetch(url, opts);
  if (!res.ok) {
    const payload = await safeJson(res).catch(() => ({}));
    throw new Error(payload?.message || payload?.error || res.statusText);
  }

  return safeJson(res);
};

// API CALLS
const getGroups = () =>

  apiFetch(
    `${API_BASE}/menu/customization-group/organization/${getOrgId()}/active`
  );

const createGroup = (data) => apiFetch(`${API_BASE}/menu/customization-group`, "POST", data);
const updateGroup = (id, data) => apiFetch(`${API_BASE}/menu/customization-group/${id}`, "PUT", data);
const deleteGroup = (id) => apiFetch(`${API_BASE}/menu/customization-group/${id}`, "DELETE");

export default function CustomizationGroupForm() {
  const [groups, setGroups] = useState([]);
  const [popup, setPopup] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editGroupId, setEditGroupId] = useState(null);
  const [viewTable, setViewTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState(null);

  const emptyGroupTemplate = {
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

  const [group, setGroup] = useState(emptyGroupTemplate);

  const loadGroups = async () => {
    try {
      setLoading(true);

      const data = await getGroups();

      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.content)) list = data.content;
      else if (Array.isArray(data?.data)) list = data.data;

      const finalGroups = list.map((g) => {
        const options = Array.isArray(g.options)
          ? g.options.map((o, idx) => ({
            id: o.id,
            optionName: o.optionName ?? o.name ?? "",
            additionalPrice: Number(o.additionalPrice ?? 0),
            isDefault: !!o.isDefault,
            isActive: o.isActive !== false,
            displayOrder: Number(o.displayOrder ?? idx),
          }))
          : [];

        return { ...g, options };
      });

      setGroups(finalGroups);
    } catch (err) {
      console.error("Failed to load groups:", err);
      alert("Failed to load groups: " + err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handle option changes in popup
  const handleOptionChange = (i, key, value) => {
    const opts = [...group.options];
    // ensure numbers for price
    if (key === "additionalPrice") value = value === "" ? "" : Number(value);
    opts[i] = { ...opts[i], [key]: value };
    setGroup({ ...group, options: opts });
  };

  const addOption = () => {
    setGroup((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          optionName: "",
          additionalPrice: 0,
          isDefault: false,
          isActive: true,
          displayOrder: prev.options.length,
        },
      ],
    }));
  };

  const removeOption = (index) => {
    setGroup((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!group.name || !group.name.trim()) {
      return alert("Group Name is required.");
    }

    const orgId = getOrgId();
    if (!orgId) return alert("Organization ID missing.");

    const dup = groups.some(
      (g) =>
        (g.name ?? g.customizationGroupName ?? "")
          .trim()
          .toLowerCase() === group.name.trim().toLowerCase() &&
        (editMode ? g.id !== editGroupId : true)
    );

    if (dup) {
      return alert("A group with this name already exists in this organization.");
    }

    const payload = {
      organizationId: orgId,
      name: group.name,
      description: group.description,
      isRequired: !!group.isRequired,
      selectionType: group.selectionType,
      maxSelections: Number(group.maxSelections ?? 1),
      isActive: group.isActive !== false,
      displayOrder: Number(group.displayOrder ?? 0),
      options:
        group.options?.map((o, i) => ({
          id: o.id,
          optionName: o.optionName,
          additionalPrice: Number(o.additionalPrice || 0),
          isDefault: !!o.isDefault,
          isActive: o.isActive !== false,
          displayOrder: Number(o.displayOrder ?? i),
        })) || [],
    };

    try {
      setLoading(true);

      if (editMode && editGroupId) {
        await updateGroup(editGroupId, payload);
        alert("Group updated successfully!");
      } else {
        await createGroup(payload);
        alert("Group created successfully!");
      }

      setGroup(emptyGroupTemplate);
      setPopup(false);
      setEditMode(false);
      setEditGroupId(null);
      await loadGroups();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error saving group: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // edit
  const editGroupFn = (grp) => {
    const normalized = {
      name: grp.name ?? grp.customizationGroupName ?? "",
      description: grp.description ?? "",
      isRequired: grp.isRequired ?? true,
      selectionType: grp.selectionType ?? "SINGLE",
      maxSelections: grp.maxSelections ?? 1,
      isActive: grp.isActive ?? true,
      displayOrder: grp.displayOrder ?? 0,
      options:
        grp.options?.map((o) => ({
          id: o.id,
          optionName: o.optionName ?? o.name ?? "",
          additionalPrice: o.additionalPrice ?? 0,
          isDefault: o.isDefault ?? false,
          isActive: o.isActive ?? true,
          displayOrder: o.displayOrder ?? 0,
        })) || [],
    };

    // ensure at least one visible empty option row in popup when there are zero options
    if (!normalized.options || normalized.options.length === 0) {
      normalized.options = [
        { optionName: "", additionalPrice: 0, isDefault: false, isActive: true, displayOrder: 0 },
      ];
    }

    setEditMode(true);
    setEditGroupId(grp.id);
    setGroup(normalized);
    setPopup(true);
  };

  const removeGroupFn = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this customization group?")) return;

    try {
      setLoading(true);
      await deleteGroup(id);
      alert("Group deleted.");
      if (expandedGroupId === id) setExpandedGroupId(null);
      await loadGroups();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => setExpandedGroupId((prev) => (prev === id ? null : id));

  const fmtPrice = (v) => {
    const n = Number(v || 0);
    return n === 0 ? "" : `+ ₹${n.toFixed(2)}`;
  };

  return (
    <div className="cg-container">
      <h2>Customization Groups</h2>

      <div className="toolbar">
        <button onClick={() => setViewTable(!viewTable)}>
          {viewTable ? "Hide Custom Groups" : "View Custom Groups"}
        </button>

        <button
          onClick={() => {
            setPopup(true);
            setEditMode(false);
            setEditGroupId(null);
            setGroup(emptyGroupTemplate);
          }}
        >
          + Add Group
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}

      {viewTable && (
        <table className="cg-table">
          <thead>
            <tr>
              <th>SL.No</th>
              <th>Group Name</th>
              <th>Options Count</th>
              <th>Required</th>
              <th>Select Type</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {groups.length > 0 ? (
              groups.map((g, idx) => (
                <React.Fragment key={g.id ?? idx}>
                  <tr>
                    <td>{idx + 1}</td>
                    <td>
                      <button type="button" className="opt-btn" onClick={() => toggleExpand(g.id)}>
                        {g.name ?? g.customizationGroupName}
                        <span style={{ marginLeft: 8 }}>{expandedGroupId === g.id ? "▼" : "▲"}</span>
                      </button>
                    </td>
                    <td>{g.optionsCount ?? g.options?.length ?? 0}</td>

                    <td>{g.isRequired ? "Yes" : "No"}</td>
                    <td>{g.selectionType}</td>
                    <td>
                      <button className="edit-btn" onClick={() => editGroupFn(g)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => removeGroupFn(g.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>

                  {expandedGroupId === g.id && (
                    <tr>
                      <td colSpan={6}>
                        <div className="opt-dropdown">
                          <div className="opt-table-head" style={{ display: "flex", gap: 24, padding: "8px 4px", fontWeight: 700 }}>
                            <div style={{ flex: 1 }}>Option Name</div>
                            <div style={{ width: 120 }}>Price</div>
                            <div style={{ width: 100 }}>Default</div>
                            <div style={{ width: 80 }}>Active</div>
                          </div>

                          <div style={{ borderTop: "1px solid #eee", marginTop: 8 }}>
                            {(g.options?.length > 0 || g.customizationOptions?.length > 0) ? (
                              (g.options || g.customizationOptions).map((o, i) => (
                                <div key={o.id ?? i} className="opt-item" style={{ display: "flex", gap: 24, padding: "12px 4px", alignItems: "center", borderBottom: "1px solid #f2f2f2" }}>
                                  <div style={{ flex: 1 }}>{o.optionName}</div>
                                  <div style={{ width: 120 }}>{fmtPrice(o.additionalPrice)}</div>
                                  <div style={{ width: 100 }}>{o.isDefault ? "Yes" : "No"}</div>
                                  <div style={{ width: 80 }}>{o.isActive ? "Yes" : "No"}</div>
                                </div>
                              ))
                            ) : (
                              <div style={{ padding: 12 }}>No options available.</div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="6">No groups found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {popup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="popup-header">
              <h2>{editMode ? "Edit Customization Group" : "Add Customization Group"}</h2>
              <button
                className="popup-close-btn"
                onClick={() => {
                  setPopup(false);
                  setEditMode(false);
                  setEditGroupId(null);
                  setGroup(emptyGroupTemplate);
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Group Name</label>
                <input type="text" placeholder="Group Name" value={group.name} onChange={(e) => setGroup({ ...group, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input type="text" placeholder="Description" value={group.description} onChange={(e) => setGroup({ ...group, description: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Select Type</label>
                <select value={group.selectionType} onChange={(e) => setGroup({ ...group, selectionType: e.target.value })}>
                  <option value="SINGLE">SINGLE</option>
                  <option value="MULTI">MULTI</option>
                </select>
              </div>

              <h4>Options</h4>

              {group.options && group.options.length === 0 && (
                <div className="option-row no-option-placeholder">
                  <div style={{ flex: 1 }}>No options yet. Click "Add Option" to create one.</div>
                </div>
              )}

              {group.options.map((opt, i) => (
                <div className="option-row" key={i}>
                  <input type="text" placeholder="Option Name" value={opt.optionName} onChange={(e) => handleOptionChange(i, "optionName", e.target.value)} />

                  <input type="number" placeholder="Additional Price" value={opt.additionalPrice === 0 ? "" : opt.additionalPrice} onChange={(e) => handleOptionChange(i, "additionalPrice", e.target.value)} />

                  <label className="opt-check">
                    <input type="checkbox" checked={!!opt.isDefault} onChange={(e) => handleOptionChange(i, "isDefault", e.target.checked)} />
                    Default
                  </label>

                  <label className="opt-check">
                    <input type="checkbox" checked={opt.isActive !== false} onChange={(e) => handleOptionChange(i, "isActive", e.target.checked)} />
                    Active
                  </label>

                  {group.options.length > 1 && (
                    <button type="button" onClick={() => removeOption(i)} className="delete-option-btn">✕</button>
                  )}
                </div>
              ))}

              <button type="button" className="add-option-btn" onClick={addOption}>+ Add Option</button>

              <div className="popup-buttons">
                <button type="submit" className="save-btn">{editMode ? "Update" : "Save"}</button>
                <button type="button" className="cancel-btn" onClick={() => { setPopup(false); setEditMode(false); setGroup(emptyGroupTemplate); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
