import React, { useEffect, useState, useCallback } from "react";
import {
  PlusSquare,
  Edit3,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminMenuCategory.css";

export default function AdminMenuCategory() {
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const CATEGORY_API = "http://localhost:8082/dine-ease/api/v1/menu-category";
  const TOKEN = localStorage.getItem("token");

  const [organizationId, setOrganizationId] = useState("");
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [newCategory, setNewCategory] = useState({
    menuCategoryName: "",
    description: "",
    parentCategoryDropdown: "",
    displayOrder: 0,
    image: null,
    isActive: true,
  });

  // ✅ Fetch organization ID
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setOrganizationId(data.organizationId);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile!");
      }
    };
    fetchProfile();
  }, [TOKEN]);

  // ✅ Fetch paginated categories
 const fetchCategories = useCallback(async () => {
  if (!organizationId) return;
  setLoading(true);
  try {
    const res = await fetch(
      `${CATEGORY_API}/${organizationId}?page=${page}&size=5&sortBy=id&sortDir=asc`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const data = await res.json();
    setCategories(data.content || []);
    setTotalPages(data.totalPages || 0);
    setTotalElements(data.totalElements || 0);
  } catch (err) {
    console.error(err);
    toast.error("Error loading categories");
  } finally {
    setLoading(false);
  }
}, [organizationId, page, TOKEN]);

useEffect(() => {
  fetchCategories();
}, [fetchCategories]);


  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ✅ Build parent-child hierarchy
  const buildTree = () => {
    const map = {};
    categories.forEach((cat) => (map[cat.id] = { ...cat, children: [] }));
    const tree = [];
    categories.forEach((cat) => {
      if (cat.parentCategoryId) {
        map[cat.parentCategoryId]?.children.push(map[cat.id]);
      } else {
        tree.push(map[cat.id]);
      }
    });
    return tree;
  };

  const renderCategoryRow = (cat, level = 0) => {
    const isExpanded = expanded[cat.id];
    const hasChildren = cat.children && cat.children.length > 0;
    const parentName = cat.parentCategoryId
      ? categories.find((p) => p.id === cat.parentCategoryId)?.name || "—"
      : "—";

    return (
      <React.Fragment key={cat.id}>
        <tr>
          <td style={{ paddingLeft: `${level * 25 + 10}px` }}>
            {hasChildren && (
              <button
                onClick={() => toggleExpand(cat.id)}
                className="expand-btn"
              >
                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            )}
            {cat.name}
          </td>
          <td>{parentName}</td>

          <td>
            {cat.imageData ? (
              <img
                src={`data:image/jpeg;base64,${cat.imageData}`}
                alt={cat.name}
                className="admin-category-photo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/no-image.png";
                }}
              />
            ) : (
              <div className="no-img">No Image</div>
            )}
          </td>

          <td>{cat.description || "—"}</td>
          <td>
            <span
              className={`status-badge ${cat.isActive ? "active" : "inactive"
                }`}
            >
              {cat.isActive ? "Active" : "Inactive"}
            </span>
          </td>
          <td className="admin-action-buttons">
            <button
              onClick={() => {
                setEditingItem(cat);
                setNewCategory({
                  menuCategoryName: cat.name,
                  description: cat.description,
                  parentCategoryDropdown: cat.parentCategoryId || "",
                  displayOrder: cat.displayOrder,
                  isActive: cat.isActive,
                  image: null,
                });
                setShowModal(true); 
              }}
            >
              <Edit3 size={16} />
            </button>
            {hasChildren ? (
              <button
                disabled
                title="Cannot delete a category that has subcategories"
                className="admin-category-disabled-delete-btn"
              >
                <Trash2 size={16} color="#aaa" />
              </button>
            ) : (
              <button onClick={() => handleDelete(cat.id)}>
                <Trash2 size={16} />
              </button>
            )}

          </td>
        </tr>

        {isExpanded &&
          hasChildren &&
          cat.children.map((child) => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };

  const handleDelete = async (id) => {
    const categoryName = categories.find((c) => c.id === id)?.name || "this category";

    // 1️⃣ Confirm delete
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) return;

    try {
      const res = await fetch(
        `${CATEGORY_API}/delete/${id}?organizationId=${organizationId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        // 🧠 Smart handling for backend constraint errors
        if (data.message?.includes("violates foreign key constraint")) {
          toast.error(
            `Cannot delete "${categoryName}" — it has linked menu items.`
          );
        } else {
          toast.error(data.message || `Failed to delete "${categoryName}".`);
        }
        return;
      }

      toast.success(data.message || "Category deleted successfully!");
      fetchCategories();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Server error while deleting category");
    }
  };






  // ✅ Updated handleSave
  const handleSave = async () => {
    if (!newCategory.menuCategoryName.trim()) {
      toast.error("Category Name is required");
      return;
    }

    try {
      let url = "";
      let options = { headers: { Authorization: `Bearer ${TOKEN}` } };

      if (editingItem) {
        // ✅ For UPDATE — backend expects query params
        const params = new URLSearchParams({
          organizationId,
          menuCategoryName: newCategory.menuCategoryName.trim(),
          description: newCategory.description || "",
          image: newCategory.image ? newCategory.image.name : "",
          displayOrder: newCategory.displayOrder || 0,
          parentCategoryName:
            categories.find((c) => c.id === newCategory.parentCategoryDropdown)
              ?.name || "",
          isActive: newCategory.isActive,
        });

        url = `${CATEGORY_API}/update/${editingItem.id}?${params.toString()}`;
        options.method = "PUT";
      } else {
        // ✅ For CREATE — backend expects FormData
        const formData = new FormData();
        formData.append("organizationId", organizationId);
        formData.append("menuCategoryName", newCategory.menuCategoryName.trim());
        formData.append("description", newCategory.description || "");
        formData.append("displayOrder", newCategory.displayOrder || 0);
        if (newCategory.image) formData.append("image", newCategory.image);
        formData.append("isActive", newCategory.isActive);
        if (newCategory.parentCategoryDropdown)
          formData.append("parentCategoryId", newCategory.parentCategoryDropdown);

        url = `${CATEGORY_API}/create`;
        options.method = "POST";
        options.body = formData;
      }

      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      toast.success(
        data.message ||
        (editingItem ? "Category updated successfully" : "Category created!")
      );

      setShowModal(false);
      setEditingItem(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Error saving category");
    }
  };

  return (
    <div className="admin-menu-category-page">
      <ToastContainer position="top-center" />
      <h2 className="admin-page-title">Menu Category Management</h2>

      <div className="admin-category-header">
        <button className="admin-add-btn" onClick={() => setShowModal(true)}>
          <PlusSquare size={18} /> Add Category
        </button>
      </div>

      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <div className="admin-table-wrapper">
          <h3 className="admin-item-list-heading">Existing Category Types</h3>
          <table className="admin-category-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Parent Category</th>
                <th>Photo</th>
                <th>Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>{buildTree().map((cat) => renderCategoryRow(cat))}</tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Prev
              </button>
              <span>
                Page {page + 1} of {totalPages} ({totalElements} total)
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="admin-category-modal-overlay">
          <div className="admin-category-modal">
            <div className="admin-category-modal-header">
              <h3>{editingItem ? "Edit Category" : "Add Category"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="admin-category-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <input
                type="text"
                placeholder="Category / Subcategory Name *"
                value={newCategory.menuCategoryName}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    menuCategoryName: e.target.value,
                  })
                }
              />
              <textarea
                placeholder="Description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
              ></textarea>

              <label>Select Parent Category (optional):</label>
              <select
                value={newCategory.parentCategoryDropdown}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    parentCategoryDropdown: e.target.value,
                  })
                }
              >
                <option value="">None (Parent Category)</option>
                {categories
                  .filter((c) => !c.parentCategoryId)
                  .map((pc) => (
                    <option key={pc.id} value={pc.id}>
                      {pc.name}
                    </option>
                  ))}
              </select>

              <label>Upload Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    image: e.target.files[0],
                  })
                }
              />

              <input
                type="number"
                placeholder="Display Order"
                value={newCategory.displayOrder}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    displayOrder: e.target.value,
                  })
                }
              />

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newCategory.isActive}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      isActive: e.target.checked,
                    })
                  }
                />{" "}
                Active
              </label>

              <button className="admin-save-btn" onClick={handleSave}>
                {editingItem ? "Update Category" : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
