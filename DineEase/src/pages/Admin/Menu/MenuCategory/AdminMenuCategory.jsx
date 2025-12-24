/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { PlusSquare, Edit3, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminMenuCategory.css";

export default function AdminMenuCategory() {
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const CATEGORY_API = "http://localhost:8082/dine-ease/api/v1/menu-category";
  const TOKEN = localStorage.getItem("token");
  // const organizationId = localStorage.getItem("organizationId");

  const [organizationId, setOrganizationId] = useState(null);
  const [categories, setCategories] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [isSubMode, setIsSubMode] = useState(false);


  const [newCategory, setNewCategory] = useState({
    menuCategoryName: "",
    description: "",
    parentCategoryId: "",
    displayOrder: 0,
    isActive: true,
    image: null,
    existingImage: null,
  });

  const [deletePopup, setDeletePopup] = useState({
    show: false,
    categoryId: null,
    categoryName: "",
    error: false,
    backendMessage: "",
  });
  const [stopDeletePopup, setStopDeletePopup] = useState({
    show: false,
    message: "",
  });



  const [expandedParents, setExpandedParents] = useState([]);
  const toggleExpand = (parentId) => {
    setExpandedParents((prev) =>
      prev.includes(parentId)
        ? prev.filter((id) => id !== parentId)
        : [...prev, parentId]
    );
  };



  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch organizationId
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("No token found. Please login.");

        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Profile fetch failed");
        const data = await res.json();

        setOrganizationId(data.organizationId); // set in state
      } catch (err) {
        console.error(err);
        toast.error("Profile fetch failed!");
      }
    };
    fetchProfile();
  }, []);


  /* --------------------- FETCH ALL CATEGORIES --------------------- */
  const fetchCategories = async (orgId) => {
    if (!orgId) {
      console.error("Organization ID not found in localStorage");
      toast.error("Organization not set. Please login again.");
      return;
    }

    try {
      const res = await fetch(
        `${CATEGORY_API}/${orgId}?page=${page}&size=${size}`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const list = data.content || [];

      const formatted = list.map(cat => ({
        ...cat,
        menuCategoryName: cat.menuCategoryName || cat.name,
        parentCategoryName: list.find(p => p.id === cat.parentCategoryId)?.menuCategoryName || null,
      }));

      setCategories(formatted);
      setTotalPages(data.totalPages || 0);

    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    if (!organizationId) return;
    fetchCategories(organizationId);
  }, [page, organizationId]);

  /* ---------------------- RESET FORM ---------------------- */
  const resetForm = () => {
    setNewCategory({
      menuCategoryName: "",
      description: "",
      parentCategoryId: "",
      displayOrder: 0,
      isActive: true,
      image: null,
    });
    setEditingItem(null);
    setIsSubMode(false);
  };

  /* ----------------------- ADD PARENT ----------------------- */
  const handleAddCategory = () => {
    resetForm();
    setShowModal(true);
  };

  /* ----------------------- ADD SUBCATEGORY ----------------------- */
  const handleAddSubcategory = (parent) => {
    setEditingItem(parent);
    setIsSubMode(true);

    setNewCategory({
      menuCategoryName: "",
      description: "",
      parentCategoryId: parent.id,
      displayOrder: 0,
      isActive: true,
      image: null,
    });

    setShowModal(true);
  };

  /* ----------------------- EDIT ----------------------- */
  const handleEdit = (item) => {
    setEditingItem(item);
    setIsSubMode(false);

    setNewCategory({
      menuCategoryName: item.menuCategoryName,
      description: item.description,
      parentCategoryId: item.parentCategoryId || "",
      displayOrder: item.displayOrder,
      isActive: item.isActive,
      image: null,
      existingImage: item.imageData || null, // ✅ keep reference
    });


    setShowModal(true);
  };


  const handleDelete = async () => {
    try {
      const res = await fetch(`${CATEGORY_API}/delete/${deletePopup.categoryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });

      // Case 1: Linked with menu items (backend sends 409)
      if (res.status === 409) {
        const errData = await res.json();

        setStopDeletePopup({
          show: true,
          message: errData.message || "This category is linked with menu items. Unable to delete.",
        });

        setDeletePopup({ show: false, categoryId: null, error: false, backendMessage: "" });
        return;
      }

      // Case 2: Deleted successfully
      if (res.status === 200 || res.status === 204) {
        setDeletePopup(prev => ({
          ...prev,
          backendMessage: "Category deleted successfully.",
        }));
        fetchCategories(organizationId);
        return;
      }

      throw new Error();

    } catch {
      setStopDeletePopup({
        show: true,
        message: "Server error while deleting category.",
      });
    }
  };



  const confirmDelete = (item) => {

    // Check if category has subcategories
    const hasSubcategories = categories.some(c => c.parentCategoryId === item.id);

    // Check if it's parent & has subcategories
    if (hasSubcategories) {
      // Show STOP popup
      setStopDeletePopup({
        show: true,
        message: `Cannot delete parent category "${item.menuCategoryName}". Please delete its subcategories first.`,
      });
      return;
    }

    // Otherwise, open normal delete popup
    setDeletePopup({
      show: true,
      categoryId: item.id,
      categoryName: item.menuCategoryName,
      error: false,
      backendMessage: "",
    });
  };

  /* ----------------------- SAVE ----------------------- */
  const handleSave = async () => {
    if (!organizationId) {
      toast.error("Organization not set. Please login again.");
      return;
    }

    if (!newCategory.menuCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("organizationId", organizationId);
      formData.append("menuCategoryName", newCategory.menuCategoryName);
      formData.append("description", newCategory.description);
      formData.append("displayOrder", newCategory.displayOrder);
      formData.append("isActive", newCategory.isActive);

      if (newCategory.parentCategoryId) {
        formData.append("parentCategoryId", newCategory.parentCategoryId);


        const parent = categories.find(c => c.id === newCategory.parentCategoryId);
        if (parent) {
          formData.append("parentCategoryName", parent.menuCategoryName);
        }
      }

      if (newCategory.image) {
        // User selected new image
        formData.append("image", newCategory.image);
      } else if (editingItem?.imageData) {
        // User did NOT select image → resend old image
        const blob = await fetch(
          `data:image/jpeg;base64,${editingItem.imageData}`
        ).then(res => res.blob());

        formData.append("image", blob, "existing-image.jpg");
      }




      let url = `${CATEGORY_API}/create`;
      let method = "POST";

      if (editingItem && !isSubMode) {
        url = `${CATEGORY_API}/update/${editingItem.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: formData,
      });

      if (!res.ok) throw new Error();

      toast.success(editingItem ? "Updated successfully" : "Created successfully");

      setShowModal(false);
      resetForm();
      fetchCategories(organizationId);
    } catch (err) {
      console.error(err);
      toast.error("Error saving category");
    }
  };


  return (
    <div>
      <ToastContainer />

      <div className="admin-menucategory-header">
        <h1>Menu Categories</h1>
        <button
          className="admin-menucategory-addBtn"
          onClick={handleAddCategory}
          disabled={!organizationId} // disable until org ID is ready
        >
          <PlusSquare size={20} /> Add Category
        </button>
      </div>

      <table className="admin-menucategory-table">
        <thead>
          <tr>
            <th>Parent Category</th>
            <th>Sub Category</th>
            <th>Image</th>
            <th>Description</th>
            <th>Order</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {categories
            .filter(c => !c.parentCategoryId)
            .map((parent) => (
              <React.Fragment key={parent.id}>
                <tr>
                  <td>
                    <button
                      onClick={() => toggleExpand(parent.id)}
                      className="expand-btn"
                      style={{ marginRight: "8px", cursor: "pointer", fontWeight: "bold", background: "none", border: "none" }}
                    >
                      <span style={{ marginRight: "16px", fontWeight: "bold", color: "#000" }}>
                        {expandedParents.includes(parent.id) ? "v" : ">"}
                      </span>
                      {parent.menuCategoryName}
                    </button>{" "}
                  </td>
                  <td>
                    <button
                      className="admin-menucategory-subBtn"
                      onClick={() => handleAddSubcategory(parent)}
                    >
                      + Subcategory
                    </button>
                  </td>
                  <td>
                    {parent.imageData ? (
                      <img
                        src={`data:image/jpeg;base64,${parent.imageData}`}
                        alt={parent.menuCategoryName}
                        className="admin-menucategory-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/no-image.png";
                        }}
                      />
                    ) : (
                      <div className="no-img">No Image</div>
                    )}
                  </td>

                  <td>{parent.description || "—"}</td>
                  <td>{parent.displayOrder}</td>
                  <td>
                    <Edit3 className="admin-menucategory-icon-edit" onClick={() => handleEdit(parent)} />
                    <Trash2 className="admin-menucategory-icon-delete" onClick={() => confirmDelete(parent)} />
                  </td>
                </tr>

                {expandedParents.includes(parent.id) && (
                  <>
                    {categories.filter(sub => sub.parentCategoryId === parent.id).length > 0 ? (
                      categories
                        .filter(sub => sub.parentCategoryId === parent.id)
                        .map(sub => (
                          <tr key={sub.id} className="subcategory-row">
                            <td style={{ paddingLeft: "30px" }}> </td>
                            <td>{sub.menuCategoryName}</td>
                            <td>
                              {sub.imageData ? (
                                <img
                                  src={`data:image/jpeg;base64,${sub.imageData}`}
                                  alt={sub.menuCategoryName}
                                  className="admin-menucategory-img"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/no-image.png";
                                  }}
                                />
                              ) : (
                                <div className="no-img">No Image</div>
                              )}
                            </td>
                            <td>{sub.description || "—"}</td>
                            <td>{sub.displayOrder}</td>
                            <td>
                              <Edit3 className="admin-menucategory-icon-edit" onClick={() => handleEdit(sub)} />
                              <Trash2 className="admin-menucategory-icon-delete" onClick={() => confirmDelete(sub)} />
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr className="subcategory-row">
                        <td style={{ paddingLeft: "30px" }}></td>
                        <td colSpan={5} style={{ fontStyle: "italic", color: "#6b7280" }}>
                          No Subcategories
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </React.Fragment>
            ))}
        </tbody>


      </table>

      {/* PAGINATION */}
      <div className="admin-menucategory-pagination-container">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="admin-menucategory-pagination-btn"
        >
          Prev
        </button>

        <span className="admin-menucategory-pagination-info">
          Page {page + 1} of {totalPages}
        </span>

        <button
          disabled={page === totalPages - 1}
          onClick={() => setPage(page + 1)}
          className="admin-menucategory-pagination-btn"
        >
          Next
        </button>
      </div>
      {deletePopup.show && (
        <div className="admin-menucategory-modalOverlay">
          <div className="admin-menucategory-modalContent">

            <div className="admin-menucategory-modalHeader">
              <h2>Delete Category</h2>
            </div>

            <div className="admin-menucategory-modalBody">
              {deletePopup.backendMessage ? (
                <p style={{ color: "green", fontWeight: "bold" }}>
                  {deletePopup.backendMessage}
                </p>
              ) : (
                <p>
                  Are you sure you want to delete <b>{deletePopup.categoryName}</b>?
                </p>
              )}
            </div>

            <div className="admin-menucategory-modalActions">

              {/* CANCEL / OK */}
              <button
                className="admin-menucategory-cancelBtn"
                onClick={() =>
                  setDeletePopup({
                    show: false,
                    categoryId: null,
                    categoryName: "",
                    error: false,
                    backendMessage: "",
                  })
                }
              >
                {deletePopup.backendMessage ? "OK" : "Cancel"}
              </button>

              {/* DELETE Button – show only when no backend message */}
              {!deletePopup.backendMessage && (
                <button className="admin-menucategory-saveBtn" onClick={handleDelete}>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {stopDeletePopup.show && (
        <div className="admin-menucategory-modalOverlay">
          <div className="admin-menucategory-modalContent">

            <div className="admin-menucategory-modalHeader">
              <h2>Cannot Delete</h2>
            </div>

            <div className="admin-menucategory-modalBody">
              <p style={{ color: "red", fontWeight: "bold" }}>
                {stopDeletePopup.message}
              </p>
            </div>

            <div className="admin-menucategory-modalActions">
              <button
                className="admin-menucategory-cancelBtn"
                onClick={() => setStopDeletePopup({ show: false, message: "" })}
              >
                OK
              </button>
            </div>

          </div>
        </div>
      )}
      {/* MODAL */}
      {showModal && (
        <div className="admin-menucategory-modalOverlay">
          <div className="admin-menucategory-modalContent">
            <div className="admin-menucategory-modalHeader">
              <h2>
                {editingItem && !isSubMode
                  ? "Edit Category"
                  : isSubMode
                    ? "Add Subcategory"
                    : "Add Category"}
              </h2>
            </div>

            <div className="admin-menucategory-modalBody">
              <div className="admin-menucategory-formGroup">
                <label>Category Name</label>
                <input
                  type="text"
                  value={newCategory.menuCategoryName}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, menuCategoryName: e.target.value })
                  }
                />
              </div>

              {isSubMode && (
                <p style={{ fontSize: "14px", marginBottom: "10px" }}>
                  Parent: <b>{editingItem.menuCategoryName}</b>
                </p>
              )}

              <div className="admin-menucategory-formGroup">
                <label>Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, description: e.target.value })
                  }
                />
              </div>

              <div className="admin-menucategory-formGroup">
                <label>Image</label>
               
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, image: e.target.files[0] })
                  }
                />
              </div>

              <div className="admin-menucategory-formGroup">
                <label>Display Order</label>
                <input
                  type="number"
                  value={newCategory.displayOrder}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, displayOrder: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="admin-menucategory-modalActions">
              <button className="admin-menucategory-cancelBtn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="admin-menucategory-saveBtn" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
