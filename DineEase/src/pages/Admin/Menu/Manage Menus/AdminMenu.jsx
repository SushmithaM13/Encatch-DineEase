import { useEffect, useState } from "react";
import {
  Newspaper,
  Edit3,
  Trash2,
  PlusSquare,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "react-toastify";
import "./menu.css";

export default function AdminMenu() {
  const API_BASE = "http://localhost:8082/dine-ease/api/v1";
  const PROFILE_API = `${API_BASE}/staff/profile`;
  const MENU_API = `${API_BASE}/menu`;

  const [organizationId, setOrganizationId] = useState("");
  const [menus, setMenus] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // dropdowns
  const [categories, setCategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [cuisines, setCuisines] = useState([]);

  const [newMenu, setNewMenu] = useState({
    organizationId: "",
    categoryId: "",
    itemName: "",
    description: "",
    image: null,
    itemTypeId: "",
    foodTypeId: "",
    cuisineTypeId: "",
    spiceLevel: 1,
    isAvailable: true,
    isRecommended: false,
    isBestseller: false,
    chefSpecial: false,
    preparationTime: 1,
    allergenInfo: "",
    variants: [],
    addons: [],
    customizationGroupIds: [],
  });

  // ---------------- FETCH PROFILE -----------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const cachedProfile = JSON.parse(localStorage.getItem("profile") || "{}");
        if (cachedProfile?.organizationId) {
          setOrganizationId(cachedProfile.organizationId);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Unauthorized: Please log in again!");
          return;
        }

        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 403) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setOrganizationId(data.organizationId);
        localStorage.setItem("profile", JSON.stringify(data));
      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error("Failed to fetch profile!");
      }
    };

    fetchProfile();
  }, []);

  // ---------------- FETCH DROPDOWNS -----------------
  useEffect(() => {
    if (!organizationId) return;

    const fetchDropdowns = async () => {
      try {
        const token = localStorage.getItem("token");

        const [catRes, itemRes, foodRes, cuisineRes] = await Promise.all([
          fetch(`${API_BASE}/menu/category/all?organizationId=${organizationId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/menu/item-type/all?organizationId=${organizationId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/menu/food-type/all?organizationId=${organizationId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/menu/cuisine-type/all?organizationId=${organizationId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setCategories(await catRes.json());
        setItemTypes(await itemRes.json());
        setFoodTypes(await foodRes.json());
        setCuisines(await cuisineRes.json());
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      }
    };

    fetchDropdowns();
  }, [organizationId]);

  // ---------------- FETCH MENUS -----------------
  useEffect(() => {
    if (!organizationId) return;

    const fetchMenus = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await fetch(`${MENU_API}/all?organizationId=${organizationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch menus");

        const data = await res.json();
        setMenus(Array.isArray(data) ? data : data?.content || []);
      } catch (err) {
        console.error("Fetch menu error:", err);
        toast.error("Error fetching menus");
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [organizationId]);

  // ---------------- IMAGE UPLOAD -----------------
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setNewMenu({ ...newMenu, image: preview });
    }
  };

  // ---------------- SAVE MENU -----------------
  const handleSave = async () => {
    if (!newMenu.itemName) {
      toast.error("Item name is required!");
      return;
    }

    const formData = new FormData();
    formData.append("organizationId", organizationId);
    formData.append("categoryId", newMenu.categoryId || 0);
    formData.append("itemName", newMenu.itemName);
    formData.append("description", newMenu.description);
    if (imageFile) formData.append("image", imageFile);
    formData.append("itemTypeId", newMenu.itemTypeId || 0);
    formData.append("foodTypeId", newMenu.foodTypeId || 0);
    formData.append("cuisineTypeId", newMenu.cuisineTypeId || 0);
    formData.append("spiceLevel", newMenu.spiceLevel);
    formData.append("isAvailable", newMenu.isAvailable);
    formData.append("isRecommended", newMenu.isRecommended);
    formData.append("isBestseller", newMenu.isBestseller);
    formData.append("chefSpecial", newMenu.chefSpecial);
    formData.append("preparationTime", newMenu.preparationTime);
    formData.append("allergenInfo", newMenu.allergenInfo || "");
    formData.append("variants", JSON.stringify(newMenu.variants));
    formData.append("addons", JSON.stringify(newMenu.addons));
    formData.append(
      "customizationGroupIds",
      JSON.stringify(newMenu.customizationGroupIds)
    );

    try {
      const token = localStorage.getItem("token");
      const url = editingItem
        ? `${MENU_API}/update/${editingItem.id}`
        : `${MENU_API}/add`;

      const res = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Save failed");

      toast.success(editingItem ? "Menu updated!" : "Menu added!");
      resetForm();
      fetchUpdatedMenus();
    } catch (err) {
      console.error(err);
      toast.error("Error saving menu");
    }
  };

  const fetchUpdatedMenus = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${MENU_API}/all?organizationId=${organizationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMenus(Array.isArray(data) ? data : data?.content || []);
  };

  // ---------------- DELETE MENU -----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${MENU_API}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Menu deleted!");
      setMenus(menus.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Error deleting menu");
    }
  };

  // ---------------- VARIANTS -----------------
  const addVariant = () =>
    setNewMenu({
      ...newMenu,
      variants: [
        ...newMenu.variants,
        {
          variantName: "",
          quantityValue: 1,
          quantityUnit: "piece",
          price: 0,
          discountPrice: 0,
          isDefault: false,
          isAvailable: true,
        },
      ],
    });

  const removeVariant = (index) => {
    const updated = [...newMenu.variants];
    updated.splice(index, 1);
    setNewMenu({ ...newMenu, variants: updated });
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingItem(null);
    setImageFile(null);
    setNewMenu({
      organizationId,
      categoryId: "",
      itemName: "",
      description: "",
      image: null,
      itemTypeId: "",
      foodTypeId: "",
      cuisineTypeId: "",
      spiceLevel: 1,
      isAvailable: true,
      isRecommended: false,
      isBestseller: false,
      chefSpecial: false,
      preparationTime: 1,
      allergenInfo: "",
      variants: [],
      addons: [],
      customizationGroupIds: [],
    });
  };

  // ---------------- UI -----------------
  return (
    <div className="admin-menu-page">
      <h2 className="admin-page-title">
        <Newspaper size={22} style={{ marginRight: "8px" }} /> Menu Management
      </h2>

      <div className="admin-menu-header">
        <input
          type="text"
          placeholder="Search item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search-input"
        />

        <button
          className="admin-add-btn"
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
        >
          <PlusSquare size={18} /> Add Menu
        </button>
      </div>

      {loading ? (
        <p>Loading menus...</p>
      ) : (
        <div className="admin-menu-grid">
          {menus.length === 0 ? (
            <p>No menu items yet.</p>
          ) : (
            menus
              .filter((m) =>
                m.itemName?.toLowerCase().includes(search.toLowerCase())
              )
              .map((menu) => (
                <div key={menu.id} className="admin-menu-card">
                  {menu.image && (
                    <img
                      src={menu.image}
                      alt={menu.itemName}
                      className="admin-menu-img"
                    />
                  )}
                  <h3 className="admin-menu-name">{menu.itemName}</h3>
                  <p className="admin-menu-desc">{menu.description}</p>
                  <div className="admin-menu-wrapper">
                    <button
                      onClick={() => {
                        setEditingItem(menu);
                        setNewMenu(menu);
                        setShowModal(true);
                      }}
                    >
                      <Edit3 size={16} /> Edit
                    </button>
                    <button onClick={() => handleDelete(menu.id)}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal large">
            <div className="admin-modal-header">
              <h3>{editingItem ? "Edit Menu" : "Add New Menu"}</h3>
              <button onClick={resetForm}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <input
                type="text"
                placeholder="Item Name *"
                value={newMenu.itemName}
                onChange={(e) =>
                  setNewMenu({ ...newMenu, itemName: e.target.value })
                }
              />

              <textarea
                placeholder="Description"
                value={newMenu.description}
                onChange={(e) =>
                  setNewMenu({ ...newMenu, description: e.target.value })
                }
              ></textarea>

              {/* DROPDOWNS */}
              <select
                value={newMenu.categoryId}
                onChange={(e) =>
                  setNewMenu({ ...newMenu, categoryId: e.target.value })
                }
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.categoryName}
                  </option>
                ))}
              </select>

              <select
                value={newMenu.itemTypeId}
                onChange={(e) =>
                  setNewMenu({ ...newMenu, itemTypeId: e.target.value })
                }
              >
                <option value="">Select Item Type</option>
                {itemTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.itemTypeName}
                  </option>
                ))}
              </select>

              <select
                value={newMenu.foodTypeId}
                onChange={(e) =>
                  setNewMenu({ ...newMenu, foodTypeId: e.target.value })
                }
              >
                <option value="">Select Food Type</option>
                {foodTypes.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.foodTypeName}
                  </option>
                ))}
              </select>

              <select
                value={newMenu.cuisineTypeId}
                onChange={(e) =>
                  setNewMenu({ ...newMenu, cuisineTypeId: e.target.value })
                }
              >
                <option value="">Select Cuisine</option>
                {cuisines.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cuisineTypeName}
                  </option>
                ))}
              </select>

              <label>Upload Image:</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {newMenu.image && (
                <img
                  src={newMenu.image}
                  alt="Preview"
                  style={{
                    width: "100px",
                    marginTop: "5px",
                    borderRadius: "8px",
                  }}
                />
              )}

              <h4 style={{ marginTop: "15px" }}>Variants</h4>
              {newMenu.variants.map((v, i) => (
                <div key={i} className="variant-row">
                  <input
                    type="text"
                    placeholder="Variant Name"
                    value={v.variantName}
                    onChange={(e) => {
                      const updated = [...newMenu.variants];
                      updated[i].variantName = e.target.value;
                      setNewMenu({ ...newMenu, variants: updated });
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={v.price}
                    onChange={(e) => {
                      const updated = [...newMenu.variants];
                      updated[i].price = e.target.value;
                      setNewMenu({ ...newMenu, variants: updated });
                    }}
                  />
                  <button onClick={() => removeVariant(i)}>
                    <Minus size={16} />
                  </button>
                </div>
              ))}
              <button onClick={addVariant} className="add-variant-btn">
                <Plus size={14} /> Add Variant
              </button>

              <div style={{ marginTop: "15px" }}>
                <button className="admin-save-btn" onClick={handleSave}>
                  {editingItem ? "Update Menu" : "Save Menu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
