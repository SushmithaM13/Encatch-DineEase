import React, { useEffect, useState } from "react";
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
  }, []);

  // ✅ Fetch paginated categories
  const fetchCategories = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${CATEGORY_API}/${organizationId}?page=${page}&size=5&sortBy=id&sortDir=asc`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();

      // ✅ Set backend pagination data
      setCategories(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
      toast.error("Error loading categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!organizationId) return;
    let ignore = false;
    const load = async () => {
      if (!ignore) await fetchCategories();
    };
    load();
    return () => {
      ignore = true;
    };
  }, [organizationId, page]);


  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ✅ Build parent-child hierarchy (for display only)
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
              <button onClick={() => toggleExpand(cat.id)} className="expand-btn">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            {cat.name}
          </td>
          <td>{parentName}</td>
          {/* <td>
            {cat.imageUrl ? (
              <img
                src={
                  cat.imageUrl.startsWith("http")
                    ? cat.imageUrl
                    : `http://localhost:8082/${cat.imageUrl
                      .replaceAll("\\", "/") // convert backslashes to forward slashes
                      .replace(/^.*uploads\//, "uploads/") // keep correct uploads path
                    }`
                }
                alt={cat.name}
                className="admin-category-photo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/no-image.png"; // fallback
                }}
              />
            ) : (
              <div className="no-img">No Image</div>
            )}

          </td> */}

          <td>{cat.description || "—"}</td>
          <td>
            <span className={`status-badge ${cat.isActive ? "active" : "inactive"}`}>
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
                  parentCategoryDropdown: cat.parentCategoryId
                    ? categories.find((p) => p.id === cat.parentCategoryId)?.name || ""
                    : "",
                  displayOrder: cat.displayOrder,
                  isActive: cat.isActive,
                  image: null,
                });
                setShowModal(true);
              }}
            >
              <Edit3 size={16} />
            </button>
            <button onClick={() => handleDelete(cat.id)}>
              <Trash2 size={16} />
            </button>
          </td>
        </tr>

        {isExpanded &&
          hasChildren &&
          cat.children.map((child) => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Delete this category?")) return;
  try {
    const res = await fetch(`${CATEGORY_API}/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (!res.ok) throw new Error("Failed to delete category");
    toast.success("Category deleted!");
    setPage(0); // ✅ triggers useEffect reload
  } catch (err) {
    console.error(err);
    toast.error("Error deleting category");
  }
};


  const handleSave = async () => {
    if (!newCategory.menuCategoryName.trim()) {
      toast.error("Category Name is required");
      return;
    }

    const formData = new FormData();
    formData.append("organizationId", organizationId);
    formData.append("menuCategoryName", newCategory.menuCategoryName.trim());
    formData.append("description", newCategory.description || "");
    formData.append("displayOrder", newCategory.displayOrder || 0);
    if (newCategory.image) formData.append("image", newCategory.image);
    formData.append("isActive", newCategory.isActive);

    const parent = categories.find(
      (c) => c.name === newCategory.parentCategoryDropdown
    );
    formData.append("parentCategoryName", parent ? parent.name : "");

    try {
      const url = editingItem
        ? `${CATEGORY_API}/update/${editingItem.id}?organizationId=${organizationId}`
        : `${CATEGORY_API}/create`;

      const res = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save category");
      toast.success(editingItem ? "Category updated!" : "Category added!");
      setShowModal(false);
      setEditingItem(null);
      setPage(0); 

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

          {/* ✅ Pagination */}
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

      {/* ✅ Modal */}
      {showModal && (
        <div className="admin-category-modal-overlay">
          <div className="admin-category-modal">
            <div className="admin-category-modal-header">
              <h3>{editingItem ? "Edit Category" : "Add Category"}</h3>
              <button onClick={() => setShowModal(false)} className="admin-category-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <input
                type="text"
                placeholder="Category / Subcategory Name *"
                value={newCategory.menuCategoryName}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, menuCategoryName: e.target.value })
                }
              />
              <textarea
                placeholder="Description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, description: e.target.value })
                }
              ></textarea>

              <label>Select Parent Category (optional):</label>
              <select
                value={newCategory.parentCategoryDropdown}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, parentCategoryDropdown: e.target.value })
                }
              >
                <option value="">None (Parent Category)</option>
                {categories
                  .filter((c) => !c.parentCategoryId)
                  .map((pc) => (
                    <option key={pc.id} value={pc.name}>
                      {pc.name}
                    </option>
                  ))}
              </select>

              <label>Upload Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setNewCategory({ ...newCategory, image: e.target.files[0] })
                }
              />

              <input
                type="number"
                placeholder="Display Order"
                value={newCategory.displayOrder}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, displayOrder: e.target.value })
                }
              />

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newCategory.isActive}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, isActive: e.target.checked })
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
