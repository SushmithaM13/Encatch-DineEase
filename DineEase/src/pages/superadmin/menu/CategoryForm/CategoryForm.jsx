import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "./CategoryForm.css";
import { toast } from "react-toastify";

export default function CategoryForm() {
  const CATEGORY_API = "http://localhost:8082/dine-ease/api/v1/menu-category";
  const TOKEN = localStorage.getItem("token");

  const token = localStorage.getItem("token");


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

  const [menuCategoryName, setMenuCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [parentCategoryName, setParentCategoryName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [useExternalUrl, setUseExternalUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
    setImagePreview(e.target.value);
  };

  const [showSubCategoryPopup, setShowSubCategoryPopup] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedParentForView, setSelectedParentForView] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subDescription, setSubDescription] = useState("");
  const [subDisplayOrder, setSubDisplayOrder] = useState(0);
  const [subIsActive, setSubIsActive] = useState(true);
  const [subImage, setSubImage] = useState(null);

  const [subUseExternalUrl, setSubUseExternalUrl] = useState(false);
  const [subImageUrl, setSubImageUrl] = useState("");
  const [subImagePreview, setSubImagePreview] = useState(null);


  // ✅ helper for category name
  const getName = (cat) =>
    cat.menuCategoryName || cat.name || cat.parentCategoryName || "Unnamed";

  // ✅ Convert image path or base64 to valid image src
  const getImageUrl = (cat) => {
    if (cat.imageData) return `data:image/jpeg;base64,${cat.imageData}`;

    // handle base64 image
    if (cat.imageData) return `data:image/jpeg;base64,${cat.imageData}`;

    // handle backend windows path
    if (cat.imageUrl) {
      const cleanedPath = cat.imageUrl.replace(/\\/g, "/");
      if (cleanedPath.includes("uploads"))
        return `http://localhost:8082/${cleanedPath.split("Backend/")[1]}`;
      return cleanedPath;
    }

    return "/default-image.png";
  };

  // ✅ Fetch subcategories by parent ID


  const fetchSubcategories = async (parentCategoryId) => {
    try {
      const response = await fetch(
        `http://localhost:8082/dine-ease/api/v1/menu-category/sub-categories/${parentCategoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch subcategories");

      const data = await response.json();
      console.log("✅ Fetched subcategories:", data);

      // Make sure data is an array
      if (Array.isArray(data)) {
        setSubCategories(data);
      } else if (data.subCategories) {
        setSubCategories(data.subCategories);
      } else {
        console.warn("⚠️ Unexpected data format:", data);
        setSubCategories([]);
      }
    } catch (error) {
      console.error("❌ Subcategory fetch error:", error);
      setSubCategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };


  const openSubcategoryModalForParentName = (cat) => {
    setSelectedParent(cat);
    setShowSubCategoryPopup(true);
  };

  const handleAddSubCategory = async () => {
    if (!selectedParent || !organizationId) {
      toast.error("Parent category missing");
      return;
    }
    if (!subCategoryName.trim()) {
      toast.error("Subcategory name is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("organizationId", organizationId);
      formData.append("menuCategoryName", subCategoryName.trim());
      formData.append("description", subDescription || "");
      formData.append("displayOrder", subDisplayOrder || 0);
      formData.append("isActive", subIsActive);
      formData.append(
        "parentCategoryName",
        selectedParent.menuCategoryName || selectedParent.name
      );
      if (!subUseExternalUrl) {
        if (subImage) formData.append("image", subImage);
      } else {
        formData.append("imageUrl", subImageUrl);
      }


      const res = await fetch(`${CATEGORY_API}/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create subcategory");

      toast.success("✅ Subcategory added successfully!");
      setShowSubCategoryPopup(false);
      setSubCategoryName("");
      setSubDescription("");
      setSubDisplayOrder(0);
      setSubImage(null);

      // 🔥 ALWAYS refresh the UI after adding
      setSelectedParentForView(selectedParent);
      fetchSubcategories(selectedParent.id);

    } catch (err) {
      console.error(err);
      toast.error("Error adding subcategory");
    }
  };


  // ====== Fetch categories ======
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
      setCategories(data.content || []);
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

  // ===== Search + Pagination =====
  useEffect(() => {
    // ✅ Step 1: Show only parent categories (no parentCategoryName)
    const parentOnly = categories.filter(
      (cat) => !cat.parentCategoryId && !cat.parentCategoryName
    );

    // ✅ Step 2: Apply search filter
    const filteredList = parentOnly.filter((cat) =>
      (cat.menuCategoryName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ Step 3: Apply pagination
    setFiltered(filteredList);
    const start = (currentPage - 1) * 5;
    const end = start + 5;
    setPaginated(filteredList.slice(start, end));
  }, [categories, searchTerm, currentPage]);


  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ===== Add Category =====
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
      if (parentCategoryName)
        formData.append("parentCategoryName", parentCategoryName);
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
      console.error(err)
      toast.error("Delete failed");
    }
  };

  const CategoryImage = ({ cat, className }) => (
    <img
      src={getImageUrl(cat)}
      alt={getName(cat)}
      className={className}
      style={{ width: "40px", height: "40px", borderRadius: "6px" }}
    />
  );

  const getImageSrc = (sub) => {
    const base64 = sub.imageData;
    const url = sub.imageUrl;

    if (base64) return `data:image/jpeg;base64,${base64}`;
    if (url) {
      let clean = url.replace(/\\/g, "/");
      const index = clean.indexOf("uploads/");
      if (index !== -1) clean = clean.substring(index);
      return `http://localhost:8082/${clean}`;
    }

    return "/default-image.png";
  };



  const handleSubImagePreview = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSubImagePreview(reader.result);
      reader.readAsDataURL(file);
      setSubImage(file);
    }
  };

  const handleSubImageUrlChange = (e) => {
    setSubImageUrl(e.target.value);
    setSubImagePreview(e.target.value);
  };





  // ======= Subcategory Edit & Delete Handlers =======
  const handleEdit = (sub) => {
    console.log("Edit subcategory:", sub);
    // You can later open a popup to update subcategory details here
    toast.info(`Editing subcategory: ${sub.subCategoryName}`);
  };

  const handleDelete = async (subCategoryId) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;

    try {
      const response = await fetch(
        `http://localhost:8082/dine-ease/api/v1/menu-category/sub-categories/${subCategoryId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );

      if (!response.ok) throw new Error("Failed to delete subcategory");

      toast.success("🗑️ Subcategory deleted successfully!");
      fetchSubcategories(selectedParentForView?.id); // refresh after delete
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      toast.error("Error deleting subcategory");
    }
  };




  return (
    <div className="category-form-container">
      <h2>🍽️ Manage Menu Categories</h2>

      {/* ======= Top Buttons ======= */}
      <div className="buttons">
        <button
          className="btn toggle-form-btn"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "✕ Hide Form" : "➕ Add Category"}
        </button>
        <button
          className="btn toggle-view-btn"
          onClick={() => setShowCategories((prev) => !prev)}
        >
          {showCategories ? "✕ Hide List" : "📋 View Categories"}
        </button>
      </div>

      {/* ======= Add Category Form ======= */}
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
                placeholder="Paste image URL (e.g., https://example.com/image.jpg)"
              />
            )}

            {imagePreview && (
              <div className="image-preview-container">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="image-preview"
                  onError={(e) => {
                    console.error("Preview failed:", imagePreview);
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                value={isActive}
                onChange={(e) => setIsActive(e.target.value === "true")}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            className="submit-btn"
            disabled={loading}
            onClick={handleAddCategory}
          >
            {loading ? "Adding..." : "Add Category"}
          </button>
        </div>
      )}

      {/* ======= View Categories Section ======= */}
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
                    <th>ID</th>
                    <th>Image</th>
                    <th>Parent Category</th>
                    <th>Description</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.id}</td>
                      <td><CategoryImage cat={cat} className="table-image" /></td>
                      <td>{cat.parentCategoryName || getName(cat) || "—"}</td>
                      <td>{cat.description || "—"}</td>
                      <td>{cat.displayOrder ?? "—"}</td>
                      <td>
                        <span className={`status-badge ${cat.isActive ? "status-active" : "status-inactive"}`}>
                          {cat.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="table-btn edit-btn"
                            onClick={() => handleEditClick(cat)}
                          >
                            ✏️
                          </button>
                          <button
                            className="table-btn delete-btn"
                            onClick={() => handleDeleteCategory(cat.id)}
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="subcategory-actions">
                          <button
                            className="subcategory-btn"
                            onClick={() => {
                              setSelectedParentForView(cat);
                              fetchSubcategories(cat.id);
                            }}
                          >
                            👁️ View Subcategories
                          </button>
                          <button
                            className="subcategory-btn add-sub-btn"
                            onClick={() => openSubcategoryModalForParentName(cat)}
                          >
                            ➕ Add Subcategory
                          </button>
                        </div>


                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======= Pagination ======= */}
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
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>

          {/* ======= Mobile View ======= */}
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
                    <span
                      className={`status-badge ${cat.isActive ? "status-active" : "status-inactive"}`}
                    >
                      {cat.isActive ? "● Active" : "● Inactive"}
                    </span>
                    <div className="card-actions">
                      <button
                        className="card-btn edit-btn"
                        onClick={() => handleEditClick(cat)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="card-btn delete-btn"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        🗑️ Delete
                      </button>
                      <button
                        className="card-btn sub-btn"
                        onClick={() => {
                          setSelectedParent(cat);
                          setShowSubCategoryPopup(true);
                        }}
                      >
                        ➕ Subcategory
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination mobile-pagination">
              <button
                className="page-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ←
              </button>
              <span className="page-info">
                {currentPage} / {totalPages}
              </span>
              <button
                className="page-btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                →
              </button>
            </div>
          </div>
        </>
      )}

      {/* ======= Subcategory Popup ======= */}
      {showSubCategoryPopup && (
        <div className="modal-overlay" onClick={() => setShowSubCategoryPopup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>➕ Add Subcategory</h3>
            <div className="popup-field">
              <label>Parent Category</label>
              <input
                type="text"
                value={
                  selectedParent?.menuCategoryName ||
                  selectedParent?.name ||
                  selectedParent?.parentCategoryName ||
                  ""
                }
                readOnly
                className="readonly-input"
              />
            </div>

            <div className="form-group">
              <label>Subcategory Name *</label>
              <input
                type="text"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                placeholder="Enter subcategory name"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={subDescription}
                onChange={(e) => setSubDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>

            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                value={subDisplayOrder}
                onChange={(e) => setSubDisplayOrder(e.target.value)}
                placeholder="0"
              />
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

                {/* <button
      type="button"
      className={`toggle-btn ${subUseExternalUrl ? "active" : ""}`}
      onClick={() => {
        setSubUseExternalUrl(true);
        setSubImage("");
      }}
    >
      🌐 External URL
    </button> */}
              </div>

              {!subUseExternalUrl ? (
                <input type="file" accept="image/*" onChange={handleSubImagePreview} />
              ) : (
                <input
                  type="text"
                  value={subImageUrl}
                  onChange={handleSubImageUrlChange}
                  placeholder="Paste image URL"
                />
              )}

              {subImagePreview && (
                <div className="image-preview-container">
                  <img src={subImagePreview} className="image-preview" />
                </div>
              )}
            </div>


            <div className="form-group">
              <label>Status</label>
              <select
                value={subIsActive}
                onChange={(e) => setSubIsActive(e.target.value === "true")}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="modal-btn add-btn" onClick={handleAddSubCategory}>
                Add
              </button>
              <button
                className="modal-btn cancel-btn"
                onClick={() => setShowSubCategoryPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedParentForView && (
        <div className="subcategory-section">
          <h3>
            📂 Subcategories of{" "}
            <span className="parent-highlight">
              {getName(selectedParentForView)}
            </span>
          </h3>

          {loadingSubcategories ? (
            <p>Loading subcategories...</p>
          ) : subCategories.length === 0 ? (
            <p className="no-subcategories">No subcategories found.</p>
          ) : (
            <div className="subcategory-table-wrapper">
              <table className="subcategory-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Order</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subCategories.map((sub, index) => (
                    <tr key={sub.id || index}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          src={getImageSrc(sub)}
                          alt={sub.menuCategoryName || "Subcategory"}
                          style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }}
                          onError={(e) => (e.target.src = "/default-image.png")}
                        />
                      </td>
                      <td>{sub.menuCategoryName || "—"}</td>
                      <td>{sub.description || "—"}</td>
                      <td>{sub.displayOrder ?? "—"}</td>
                      <td>{sub.isActive ? "Active" : "Inactive"}</td>
                      <td>
                        <button onClick={() => handleEdit(sub)}>Edit</button>
                        <button onClick={() => handleDelete(sub.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}

                </tbody>


              </table>
            </div>
          )}
        </div>
      )}

      {/* ======= Edit Modal ======= */}
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
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="image-preview"
                    />
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
              <button
                className="modal-btn update-btn"
                onClick={handleUpdateCategory}
              >
                ✓ Update
              </button>
              <button
                className="modal-btn cancel-btn"
                onClick={() => setShowModal(false)}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}