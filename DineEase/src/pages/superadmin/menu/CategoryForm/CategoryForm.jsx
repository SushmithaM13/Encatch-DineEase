import React, { useState, useEffect, useCallback } from "react";
import "./CategoryForm.css";
import { toast } from "react-toastify";

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

  // ✅ Subcategory popup state
  const [showSubCategoryPopup, setShowSubCategoryPopup] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  // ✅ Subcategory form fields
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subDescription, setSubDescription] = useState("");
  const [subDisplayOrder, setSubDisplayOrder] = useState("");
  const [subIsActive, setSubIsActive] = useState(true);
  const [subImage, setSubImage] = useState(null);


// Subcategories view states
const [selectedParentForView, setSelectedParentForView] = useState(null);
const [subCategories, setSubCategories] = useState([]);
const [loadingSubcategories, setLoadingSubcategories] = useState(false);



  const itemsPerPage = 2;
  const organizationId = localStorage.getItem("organizationId");
  const token = localStorage.getItem("token");

  // ✅ Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!organizationId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8082/dine-ease/api/v1/menu-category/${organizationId}?page=0&size=5&sortBy=id&sortDir=desc`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      const list =
        data?.data?.content || data?.content || data?.data || data || [];
      setCategories(Array.isArray(list) ? list : []);
console.log("wrong data getting")

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

  // ✅ Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageUrl("");
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setImage(null);
    if (url.trim()) setImagePreview(url);
    else setImagePreview(null);
  };

  // ✅ Add Category
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

    if (imageUrl.trim()) formData.append("imageUrl", imageUrl.trim());
    else if (image) formData.append("image", image);

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
        alert("❌ Failed to add category");
        return;
      }

      alert("✅ Category added successfully!");
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
      console.error("Error:", err);
      alert("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete Category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(
        `http://localhost:8082/dine-ease/api/v1/menu-category/delete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        alert("🗑️ Deleted successfully!");
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      } else {
        alert("❌ Failed to delete");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting category");
    }
  };

  // ✅ Edit Modal
  const handleEditClick = (cat) => {
    setEditingCategory({
      ...cat,
      menuCategoryName: cat.menuCategoryName || cat.name || "",
    });
    setShowModal(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    const {
      id,
      menuCategoryName,
      description,
      displayOrder,
      parentCategoryName,
      isActive,
    } = editingCategory;
    const finalName = menuCategoryName || "";

    const apiUrl = `http://localhost:8082/dine-ease/api/v1/menu-category/update/${id}?organizationId=${organizationId}&menuCategoryName=${encodeURIComponent(
      finalName
    )}&description=${encodeURIComponent(
      description || ""
    )}&displayOrder=${displayOrder || 0}&parentCategoryName=${encodeURIComponent(
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
        alert("✅ Updated successfully!");
        setShowModal(false);
        await fetchCategories();
      } else {
        alert("❌ Failed to update");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating category");
    }
  };

  // sub category functionality


  // ✅ Open Subcategory Popup
const openSubcategoryModalForParentName = (parentCategory) => {
  setSelectedParent(parentCategory);
  setShowSubCategoryPopup(true);
};

// ✅ Handle File Upload
const handleSubImageChange = (e) => {
  const file = e.target.files[0];
  setSubImage(file);
};

 const handleAddSubCategory = async (e) => {
  e.preventDefault();

  if (!selectedParent || !organizationId || !token) {
    toast.error("Missing required data — please check category or login!");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("name", subCategoryName);
    formData.append("description", subDescription);
    formData.append("displayOrder", subDisplayOrder || 0);
    formData.append("isActive", subIsActive);
    formData.append("organizationId", organizationId);
    formData.append("parentId", selectedParent.id); // 👈 correct parent link
    if (subImage) formData.append("image", subImage);

    const response = await fetch("http://localhost:8082/dine-ease/api/v1/menu-category", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    

    if (response.ok) {
      toast.success("✅ Subcategory added successfully!");
      setShowSubCategoryPopup(false);
      setSelectedParent(null);
      setSubCategoryName("");
      setSubDescription("");
      setSubDisplayOrder("");
      setSubImage(null);

      // Refresh the subcategory list for this parent
      fetchSubcategories(selectedParent.id);
    } else {
      const errorData = await response.json();
      console.error("❌ Backend error:", errorData);
      toast.error("Failed to add subcategory");
    }
  } catch (err) {
    console.error("❌ Error adding subcategory:", err);
    toast.error("Something went wrong while adding subcategory");
  }
};


// ✅ Fetch subcategories for a specific parent
const fetchSubcategories = async (parentId) => {
  if (!parentId || !organizationId || !token) return;
  setLoadingSubcategories(true);
  try {
    const res = await fetch(
      `http://localhost:8082/dine-ease/api/v1/menu-category/sub-categories/${parentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    console.log("🔍 Subcategory API response:", data);

    const list = Array.isArray(data) ? data : data?.data || data?.content || [];
    setSubCategories(Array.isArray(list) ? list : []);
  } catch (err) {
    console.error("❌ Error fetching subcategories:", err);
    setSubCategories([]);
  } finally {
    setLoadingSubcategories(false);
  }
};


  // ✅ Get image source
  const getImageSrc = (cat) => {
    if (!cat) return null;
    if (cat.imageData) return `data:image/jpeg;base64,${cat.imageData}`;
    if (cat.imageUrl) {
      let imagePath = cat.imageUrl.trim();
      if (/^https?:\/\//i.test(imagePath)) return imagePath;
      if (imagePath.includes("uploads/")) {
        const relativePath = imagePath.substring(imagePath.indexOf("uploads/"));
        return `http://localhost:8082/${relativePath}`;
      }
    }
    return null;
  };

  const CategoryImage = ({ cat, className }) => {
    const [error, setError] = useState(false);
    const src = getImageSrc(cat);
    if (!src || error)
      return (
        <img src="/images/food.jpg" alt="Default food" className={className} />
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

  // ✅ Filtered and paginated categories
  const filtered = categories.filter((c) =>
    getName(c).toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

          <div className="form-group">
            <label>Image File Path / Upload</label>
            <input type="file" accept="image/*" onChange={handleSubImageChange} />
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
            {subCategories.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.id}</td>
                <td>
                  <img
                    src={sub.imageUrl || "/default-image.png"}
                    alt={getName(sub)}
                    style={{ width: "40px", height: "40px", borderRadius: "6px" }}
                  />
                </td>
                <td>{getName(sub)}</td>
                <td>{sub.description || "—"}</td>
                <td>{sub.displayOrder ?? "—"}</td>
                <td>
                  <span
                    className={`status-badge ${
                      sub.isActive ? "status-active" : "status-inactive"
                    }`}
                  >
                    {sub.isActive ? "Active" : "Inactive"}
                  </span>
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