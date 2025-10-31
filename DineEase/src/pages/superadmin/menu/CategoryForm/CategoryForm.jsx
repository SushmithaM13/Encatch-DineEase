import React, { useState, useEffect, useCallback } from "react";

//import myImage from "../../../images/food.jpg";



import "./CategoryForm.css";

export default function CategoryForm() {
  const [categories, setCategories] = useState([]);
  const [menuCategoryName, setMenuCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [parentCategoryName, setParentCategoryName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [useExternalUrl, setUseExternalUrl] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const itemsPerPage = 6;

  const organizationId = localStorage.getItem("organizationId");
  const token = localStorage.getItem("token");

  // ✅ Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!organizationId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8082/dine-ease/api/v1/menu-category/${organizationId}?page=0&size=100&sortBy=id&sortDir=desc`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      const list = data?.data?.content || data?.content || data?.data || data || [];
      setCategories(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch error", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getName = (cat) => cat?.menuCategoryName || cat?.name || "";

  // ✅ Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageUrl("");
    }
  };

  // ✅ Handle URL input
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setImage(null);
    if (url.trim()) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  // ✅ Add category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!menuCategoryName.trim()) {
      alert("Category name is required!");
      return;
    }

    const formData = new FormData();
    formData.append("organizationId", organizationId);
    formData.append("menuCategoryName", menuCategoryName.trim());
    formData.append("description", description.trim());
    formData.append("displayOrder", Number(displayOrder) || 0);
    formData.append("parentCategoryName", parentCategoryName.trim() || "");
    formData.append("isActive", isActive);

    if (imageUrl.trim()) {
      formData.append("imageUrl", imageUrl.trim());
      console.log("Appending image URL:", imageUrl);
    } 
    else if (image) {
      formData.append("image", image);
      console.log("Appending image file:", image);
    }

    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:8082/dine-ease/api/v1/menu-category/create",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) {
        alert(" Failed to add category");
        return;
      }

      alert(" Category added successfully!");
      setMenuCategoryName("");
      setDescription("");
      setDisplayOrder("");
      setParentCategoryName("");
      setIsActive(true);
      setImage(null);
      setImageUrl("");
      setImagePreview(null);
      setUseExternalUrl(false);

      await fetchCategories();
    } catch (err) {
      console.error(" Exception:", err);
      alert("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  //  Delete category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(
        `http://localhost:8082/dine-ease/api/v1/menu-category/delete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        alert(" Deleted successfully!");
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      } else {
        alert(" Failed to delete");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert(" Error deleting category");
    }
  };

  // ✅ Edit modal
  const handleEditClick = (cat) => {
    setEditingCategory({
      ...cat,
      menuCategoryName: cat.menuCategoryName || cat.name || "",
    });
    setShowModal(true);
  };

  // ✅ Update category
  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    const { id, menuCategoryName, description, displayOrder, parentCategoryName, isActive } = editingCategory;
    const finalName = menuCategoryName || "";

    const apiUrl = `http://localhost:8082/dine-ease/api/v1/menu-category/update/${id}?organizationId=${organizationId}&menuCategoryName=${encodeURIComponent(
      finalName
    )}&description=${encodeURIComponent(description || "")}&displayOrder=${displayOrder || 0}&parentCategoryName=${encodeURIComponent(
      parentCategoryName || ""
    )}&isActive=${isActive}`;

    try {
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        alert(" Updated successfully!");
        setShowModal(false);
        await fetchCategories();
      } else {
        alert(" Failed to update");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert(" Error updating");
    }
  };
  
 // ✅ Converts file:/// or Windows paths into proper backend URLs
const getImageSrc = (cat) => {
  if (!cat || !cat.imageUrl) return null;

  let imagePath = cat.imageUrl.trim();

  // If it's already a valid HTTP or HTTPS URL (external)
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  // If it starts with file:/// (Windows-style absolute path)
  if (imagePath.startsWith("file:///")) {
    // Normalize slashes
    imagePath = imagePath.replace(/\\/g, "/");

    // Find "uploads" folder inside the path
    const uploadsIndex = imagePath.toLowerCase().indexOf("uploads/");
    if (uploadsIndex !== -1) {
      const relativePath = imagePath.substring(uploadsIndex);
      return `http://localhost:8082/${relativePath}`;
    }
  }

  // If it's a raw Windows path (E:\React\...)
  if (imagePath.includes("E:/") || imagePath.includes("e:/")) {
    imagePath = imagePath.replace(/\\/g, "/");
    const uploadsIndex = imagePath.toLowerCase().indexOf("uploads/");
    if (uploadsIndex !== -1) {
      const relativePath = imagePath.substring(uploadsIndex);
      return `http://localhost:8082/${relativePath}`;
    }
  }

  // Default fallback (if backend gives only filename)
  return `http://localhost:8082/uploads/menu-image/${imagePath}`;
};


  // ✅ Pagination & filter
  const filtered = categories.filter((c) =>
    getName(c).toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ✅ Image component
 const CategoryImage = ({ cat, className }) => {
  const [error, setError] = useState(false);
  const src = getImageSrc(cat);

  if (!src || error)
    return (
      <img
        src="/images/food.jpg" 
        alt="Default food"
        className={className}
      />
    );

  return (
    <img
      src={src}
      alt={cat.name || cat.menuCategoryName}
      className={className}
      onError={() => setError(true)}
    />
  );
};


  return (
    <div className="category-form-container">
      <h2>🍽️ Manage Menu Categories</h2>

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
                className={`toggle-btn ${!useExternalUrl ? 'active' : ''}`}
                onClick={() => {
                  setUseExternalUrl(false);
                  setImageUrl("");
                  setImagePreview(null);
                }}
              >
                📁 Upload File
              </button>
              <button
                type="button"
                className={`toggle-btn ${useExternalUrl ? 'active' : ''}`}
                onClick={() => {
                  setUseExternalUrl(true);
                  setImage(null);
                  setImagePreview(null);
                }}
              >
                🌐 External URL
              </button>
            </div>

            {!useExternalUrl ? (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            ) : (
              <input
                type="text"
                value={imageUrl}
                onChange={handleImageUrlChange}
                placeholder="Paste image URL here (e.g., https://example.com/image.jpg)"
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
            {loading ? "Adding..." : " Add Category"}
          </button>
        </div>
      )}

      {showCategories && (
        <div className="categories-section">
          <div className="section-header">
            <h3 className="category-list-title">
              📋 Categories ({filtered.length})
            </h3>
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {loading ? (
            <div className="loading-text">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📭</div>
              <p>No Categories Found</p>
              <small>Add a category using the form above</small>
            </div>
          ) : (
            <>
              <div className="web-view">
                <div className="category-table-wrapper">
                  <table className="category-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Order</th>
                        <th>Parent</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((cat) => (
                        <tr key={cat.id}>
                          <td>{cat.id}</td>
                          <td>
                            <div className="image-cell">
                              <CategoryImage cat={cat} className="table-image" />
                            </div>
                          </td>
                          <td className="name-cell">{getName(cat)}</td>
                          <td className="desc-cell">{cat.description || "—"}</td>
                          <td>{cat.displayOrder ?? "—"}</td>
                          <td>{cat.parentCategoryName || "—"}</td>
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
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                className="table-btn delete-btn"
                                onClick={() => handleDeleteCategory(cat.id)}
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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
              </div>

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
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

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

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingCategory.isActive === true || editingCategory.isActive === "true"}
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
    </div>
  );
}