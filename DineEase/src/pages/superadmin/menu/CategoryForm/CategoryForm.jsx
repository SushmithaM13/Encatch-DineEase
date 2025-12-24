import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "./CategoryForm.css";
import { toast } from "react-toastify";

export default function CategoryForm() {
  const CATEGORY_API = "http://localhost:8082/dine-ease/api/v1/menu-category";
  const TOKEN = localStorage.getItem("token");

  const location = useLocation();
  const organizationId =
    location.state?.organizationId || localStorage.getItem("organizationId");

  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [paginated, setPaginated] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // Parent add form state (your existing add category)
  const [menuCategoryName, setMenuCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [parentCategoryName, setParentCategoryName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // image / url for main add
  const [useExternalUrl, setUseExternalUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  // ===== Subcategory states (for modal and inline form) =====
  const [showSubModal, setShowSubModal] = useState(false); // popup modal for subcategory
  const [selectedParent, setSelectedParent] = useState(null); // parent object when adding sub
  const [expandedParents, setExpandedParents] = useState([]); // parents with inline form open

  // shared subcategory form fields (will be used both by modal & inline)
  const [subMenuCategoryName, setSubMenuCategoryName] = useState("");
  const [subDescription, setSubDescription] = useState("");
  const [subDisplayOrder, setSubDisplayOrder] = useState(0);
  const [subIsActive, setSubIsActive] = useState(true);
  const [subImageFile, setSubImageFile] = useState(null);
  const [subImagePreview, setSubImagePreview] = useState(null);
  const [subUseExternalUrl, setSubUseExternalUrl] = useState(false);
  const [subImageUrl, setSubImageUrl] = useState("");

  // helper: get name (keeps your helper)
  const getName = (cat) =>
    cat.menuCategoryName || cat.name || cat.parentCategoryName || "Unnamed";

  // Convert image path or base64 to valid image src (kept from your code)
  const getImageUrl = (cat) => {
    if (cat.imageData) return `data:image/jpeg;base64,${cat.imageData}`;
    if (cat.imageUrl) {
      const cleanedPath = cat.imageUrl.replace(/\\/g, "/");
      if (cleanedPath.includes("uploads"))
        return `http://localhost:8082/${cleanedPath.split("Backend/")[1]}`;
      return cleanedPath;
    }
    return "/default-image.png";
  };

  // ===== Fetch categories (kept mostly identical, but set parentCategoryName like admin) =====
  const fetchCategories = useCallback(async () => {
    if (!organizationId) {
      toast.warn("Organization ID missing — reload dashboard");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${CATEGORY_API}/${organizationId}?page=0&size=10&sortBy=id&sortDir=asc`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      const list = data.content || [];

      // ensure menuCategoryName exists and compute parentCategoryName (like Admin)
      let formatted = list.map((cat) => ({
        ...cat,
        menuCategoryName: cat.menuCategoryName || cat.name,
      }));

      formatted = formatted.map((cat) => {
        const parent = formatted.find((p) => p.id === cat.parentCategoryId);
        return {
          ...cat,
          parentCategoryName: parent ? parent.menuCategoryName : cat.parentCategoryName || null,
        };
      });

      setCategories(formatted);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error("Error loading categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, TOKEN]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ===== Search + Pagination (kept behavior as you had) =====
  useEffect(() => {
    const parentOnly = categories.filter(
      (cat) => !cat.parentCategoryId && !cat.parentCategoryName
    );

    const filteredList = parentOnly.filter((cat) =>
      (cat.menuCategoryName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFiltered(filteredList);
    const start = (currentPage - 1) * 5;
    const end = start + 5;
    setPaginated(filteredList.slice(start, end));
  }, [categories, searchTerm, currentPage]);

  // ===== Image handlers for parent form (kept) =====
  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
    setImagePreview(e.target.value);
  };
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ===== Sub image handlers =====
  const handleSubImagePreview = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSubImagePreview(reader.result);
      reader.readAsDataURL(file);
      setSubImageFile(file);
    }
  };
  const handleSubImageUrlChange = (e) => {
    setSubImageUrl(e.target.value);
    setSubImagePreview(e.target.value);
  };

  // ===== Add Parent Category (kept your existing function) =====
  const handleAddCategory = async () => {
    if (!organizationId) {
      toast.error("Organization ID missing");
      return;
    }
    if (!menuCategoryName.trim()) {
      toast.error("Category name required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("organizationId", organizationId);
      formData.append("menuCategoryName", menuCategoryName.trim());
      formData.append("description", description || "");
      formData.append("displayOrder", displayOrder || 0);
      formData.append("isActive", isActive);
      if (parentCategoryName) formData.append("parentCategoryName", parentCategoryName);
      if (imagePreview) {
        const blob = await fetch(imagePreview).then((r) => r.blob());
        formData.append("image", blob, "category.jpg");
      }

      const res = await fetch(`${CATEGORY_API}/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      toast.success("✅ Category added!");
      setShowForm(false);
      setMenuCategoryName("");
      setDescription("");
      setDisplayOrder(0);
      setParentCategoryName("");
      setImagePreview(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || "Error adding category");
    }
  };

  // ===== Edit & Update (kept) =====
  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setShowModal(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    try {
      const params = new URLSearchParams({
        organizationId,
        menuCategoryName: editingCategory.menuCategoryName,
        description: editingCategory.description || "",
        displayOrder: editingCategory.displayOrder || 0,
        isActive: editingCategory.isActive,
      });

      const res = await fetch(
        `${CATEGORY_API}/update/${editingCategory.id}?${params.toString()}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );

      if (!res.ok) throw new Error("Update failed");
      toast.success("✅ Category updated!");
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error("Error updating category");
      console.error(err);
    }
  };

  // ===== Delete (kept) =====
  const handleDeleteCategory = async (id) => {
    const cat = categories.find((c) => c.id === id);
    if (!window.confirm(`Delete category "${cat.menuCategoryName}"?`)) return;
    try {
      const res = await fetch(
        `${CATEGORY_API}/delete/${id}?organizationId=${organizationId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      if (!res.ok) throw new Error("Delete failed");
      toast.success("🗑️ Category deleted");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // ===== Category image component (kept) =====
  const CategoryImage = ({ cat, className }) => (
    <img
      src={getImageUrl(cat)}
      alt={getName(cat)}
      className={className}
      style={{ width: "40px", height: "40px", borderRadius: "6px" }}
    />
  );

  // ===== Inline dropdown toggle helpers =====

const getSubcategories = (parentId) => {
  return categories.filter((cat) => cat.parentCategoryId === parentId);
};

const toggleExpand = (id) => {
  const opening = !expandedParents.includes(id);

  setExpandedParents((prev) =>
    prev.includes(id)
      ? prev.filter((pid) => pid !== id)
      : [...prev, id]
  );

  if (opening) {
    const parent = categories.find((c) => c.id === id);
    setSelectedParent(parent || null);
    resetSubForm();
  } else {
    setSelectedParent(null);
    resetSubForm();
  }
};


  // ===== Reset subcategory form =====
  const resetSubForm = () => {
    setSubMenuCategoryName("");
    setSubDescription("");
    setSubDisplayOrder(0);
    setSubIsActive(true);
    setSubImageFile(null);
    setSubImagePreview(null);
    setSubUseExternalUrl(false);
    setSubImageUrl("");
  };

  // ===== Open modal for subcategory (when clicking "Add Sub Category" button) =====
  const openSubModalFor = (parent) => {
    setSelectedParent(parent);
    // prefill parent id in sub form (we use parent on submit)
    resetSubForm();
    setShowSubModal(true);
  };

  // ===== Create subcategory (used by both modal and inline) =====
  const handleSaveSubcategory = async (closeAfter = true) => {
    if (!selectedParent) {
      toast.error("Parent category not selected");
      return;
    }
    if (!subMenuCategoryName.trim()) {
      toast.error("Subcategory name required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("organizationId", organizationId);
      formData.append("menuCategoryName", subMenuCategoryName.trim());
      formData.append("description", subDescription || "");
      formData.append("displayOrder", subDisplayOrder || 0);
      formData.append("isActive", subIsActive);

      // Option C: include both parentCategoryId and parentCategoryName
      formData.append("parentCategoryId", selectedParent.id);
      formData.append("parentCategoryName", selectedParent.menuCategoryName || selectedParent.name);

      if (subImagePreview) {
        // if preview is a data URL (file) convert to blob
        if (subImageFile) {
          formData.append("image", subImageFile);
        } else {
          // if user provided URL (string), try to fetch and append blob
          try {
            const blob = await fetch(subImagePreview).then((r) => r.blob());
            formData.append("image", blob, "subcategory.jpg");
          } catch {
            // ignore if URL fetch fails; backend may accept imageUrl separately
          }
        }
      }

      const res = await fetch(`${CATEGORY_API}/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      toast.success("✅ Subcategory added!");
      // close modal or collapse inline form depending on how it was invoked
      if (closeAfter) setShowSubModal(false);
      // ensure inline form closes and selection cleared
      setExpandedParents((prev) => prev.filter((id) => id !== selectedParent.id));
      setSelectedParent(null);
      resetSubForm();
      // refresh immediately
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error adding subcategory");
    }
  };

  // ===== Render =====
  return (
    <div className="category-form-container">
      <h2>🍽️ Manage Menu Categories</h2>

      {/* Top buttons */}
      <div className="buttons">
        <button className="btn toggle-form-btn" onClick={() => setShowForm((p) => !p)}>
          {showForm ? "✕ Hide Form" : "➕ Add Category"}
        </button>
        <button className="btn toggle-view-btn" onClick={() => setShowCategories((p) => !p)}>
          {showCategories ? "✕ Hide List" : "📋 View Categories"}
        </button>
      </div>

      {/* Add Parent Category Form */}
      {showForm && (
        <div className="category-form">
          <div className="form-row">
            <div className="form-group">
              <label>Category Name *</label>
              <input
                type="text"
                value={menuCategoryName}
                onChange={(e) => setMenuCategoryName(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Parent Category</label>
              <input
                type="text"
                value={parentCategoryName}
                onChange={(e) => setParentCategoryName(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Image</label>
            <div className="image-input-toggle">
              <button
                type="button"
                className={`toggle-btn ${!useExternalUrl ? "active" : ""}`}
                onClick={() => {
                  setUseExternalUrl(false);
                  setImageUrl("");
                  setImagePreview(null);
                }}
              >
                📁 Upload File
              </button>
            </div>

            {!useExternalUrl ? (
              <input type="file" accept="image/*" onChange={handleImageChange} />
            ) : (
              <input
                type="text"
                value={imageUrl}
                onChange={handleImageUrlChange}
                placeholder="Paste image URL"
              />
            )}

            {imagePreview && (
              <div className="image-preview-container">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="image-preview"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select value={isActive} onChange={(e) => setIsActive(e.target.value === "true")}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <button type="button" className="submit-btn" disabled={loading} onClick={handleAddCategory}>
            {loading ? "Adding..." : "Add Category"}
          </button>
        </div>
      )}

      {/* View Categories */}
      {showCategories && (
        <>
          <div className="categories-section">
            <div className="section-header">
              <h3>📋 Categories ({filtered.length})</h3>
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="category-table-wrapper">
              <table className="category-table">
                <thead>
                  <tr>
                    <th>Parent Category</th>
                    <th>Sub Category</th>
                    <th>Image</th>
                    <th>Description</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((cat) => {
                    const subs = getSubcategories(cat.id);

                    return (
                      <React.Fragment key={cat.id}>
                        {/* Parent row */}
                        <tr>
                          <td>
                            <button
                              className="link-like"
                              onClick={() => toggleExpand(cat.id)}
                              style={{ background: "none", border: "none", cursor: "pointer" }}
                            >
                              {cat.menuCategoryName || "—"}
                            </button>
                          </td>

                          <td>
                            <button className="btn small" onClick={() => openSubModalFor(cat)}>
                              ➕ Add Sub Category
                            </button>
                          </td>

                          <td><CategoryImage cat={cat} className="table-image" /></td>
                          <td>{cat.description || "—"}</td>
                          <td>{cat.displayOrder ?? "—"}</td>
                          <td>
                            <span className={`status-badge ${cat.isActive ? "status-active" : "status-inactive"}`}>
                              {cat.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="table-btn edit-btn" onClick={() => handleEditClick(cat)}>✏️</button>
                              <button className="table-btn delete-btn" onClick={() => handleDeleteCategory(cat.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>

                        {/* Subcategory rows (visible only when expanded) */}
                        {expandedParents.includes(cat.id) &&
                          subs.map((sub) => (
                            <tr key={sub.id} className="subcategory-row">
                              <td style={{ paddingLeft: "40px", fontWeight: "bold", color: "#444" }}>
                                ↳ {sub.menuCategoryName}
                              </td>
                              <td>—</td>
                              <td><CategoryImage cat={sub} className="table-image" /></td>
                              <td>{sub.description || "—"}</td>
                              <td>{sub.displayOrder !== null && sub.displayOrder !== undefined ? sub.displayOrder : "—"}</td>

                              <td>
                                <span className={`status-badge ${sub.isActive ? "status-active" : "status-inactive"}`}>
                                  {sub.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button className="table-btn edit-btn" onClick={() => handleEditClick(sub)}>✏️</button>
                                  <button className="table-btn delete-btn" onClick={() => handleDeleteCategory(sub.id)}>🗑️</button>
                                </div>
                              </td>
                            </tr>
                          ))
                        }
                      </React.Fragment>
                    );
                  })}

                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        </>
      )}

      {/* Mobile view (kept) */}
      {showCategories && (
        <div className="mobile-view">
          <div className="categories-container">
            {paginated.map((cat) => (
              <div className="category-card" key={cat.id}>
                <div className="card-image-container">
                  <CategoryImage cat={cat} className="card-image" />
                </div>
                <div className="card-content">
                  <h4 className="card-title">{getName(cat)}</h4>
                  <p className="card-desc">{cat.description || "No description"}</p>
                  <div className="card-meta">
                    <span>Order: {cat.displayOrder ?? "—"}</span>
                    <span>•</span>
                    <span>{cat.parentCategoryName || "No parent"}</span>
                  </div>
                  <span className={`status-badge ${cat.isActive ? "status-active" : "status-inactive"}`}>
                    {cat.isActive ? "● Active" : "● Inactive"}
                  </span>
                  <div className="card-actions">
                    <button className="card-btn edit-btn" onClick={() => handleEditClick(cat)}>
                      ✏️ Edit
                    </button>
                    <button className="card-btn delete-btn" onClick={() => handleDeleteCategory(cat.id)}>
                      🗑️ Delete
                    </button>
                    <button
                      className="card-btn sub-btn"
                      onClick={() => {
                        setSelectedParent(cat);
                        setShowSubModal(true);
                      }}
                    >
                      ➕ Subcategory
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal (kept) */}
      {showModal && editingCategory && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ Edit Category</h3>

            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                value={editingCategory.menuCategoryName || editingCategory.name || ""}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    menuCategoryName: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={editingCategory.description || ""}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  value={editingCategory.displayOrder ?? ""}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      displayOrder: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group full-width">
                <label>Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingCategory.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      isActive: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-btn update-btn" onClick={handleUpdateCategory}>
                ✓ Update
              </button>
              <button className="modal-btn cancel-btn" onClick={() => setShowModal(false)}>
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Modal (same inputs as Add Category but WITHOUT parent input) */}
      {showSubModal && selectedParent && (
        <div className="modal-overlay" onClick={() => setShowSubModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Subcategory for {selectedParent.menuCategoryName}</h3>

            <div className="form-group">
              <label>Category Name *</label>
              <input type="text" value={subMenuCategoryName} onChange={(e) => setSubMenuCategoryName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input type="text" value={subDescription} onChange={(e) => setSubDescription(e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Display Order</label>
                <input type="number" value={subDisplayOrder} onChange={(e) => setSubDisplayOrder(e.target.value)} />
              </div>

              <div className="form-group full-width">
                <label>Image</label>
                <div className="image-input-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${!subUseExternalUrl ? "active" : ""}`}
                    onClick={() => {
                      setSubUseExternalUrl(false);
                      setSubImageUrl("");
                      setSubImagePreview(null);
                    }}
                  >
                    📁 Upload File
                  </button>
                  
                </div>

                {!subUseExternalUrl ? (
                  <input type="file" accept="image/*" onChange={handleSubImagePreview} />
                ) : (
                  <input type="text" value={subImageUrl} onChange={handleSubImageUrlChange} placeholder="Image URL" />
                )}

                {subImagePreview && (
                  <div className="image-preview-container">
                    <img src={subImagePreview} alt="Preview" className="image-preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Status</label>
                <select value={subIsActive ? "true" : "false"} onChange={(e) => setSubIsActive(e.target.value === "true")}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn update-btn"
                onClick={() => {
                  // ensure selected parent is set and save
                  handleSaveSubcategory(true);
                }}
              >
                ✓ Save
              </button>
              <button className="modal-btn cancel-btn" onClick={() => setShowSubModal(false)}>
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
