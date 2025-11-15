import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import "./AdminMenuDetail.css";

export default function AdminMenuDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [menu, setMenu] = useState(null);
  const [categories, setCategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [organizationId, setOrganizationId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [addons, setAddons] = useState([]);
  const [customizationGroups, setCustomizationGroups] = useState([]);

  const API_BASE = "http://localhost:8082/dine-ease/api/v1/menu";
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";

  // ---------- Safe JSON Fetch ----------
  const fetchJson = async (url) => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        console.error(`Request failed: ${url} status=${res.status}`);
        return [];
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      return [];
    }
  };

  // ---------- Fetch Profile ----------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("Unauthorized: Please log in!");
        const res = await fetch(PROFILE_API, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setOrganizationId(data.organizationId || data.organization?.id || "");
      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  // ---------- Fetch Reference Types ----------
  useEffect(() => {
    if (!organizationId) return;
    const fetchTypes = async () => {
      setCategories(await fetchJson(`${API_BASE}/categories/${organizationId}`) || []);
      setItemTypes(await fetchJson(`${API_BASE}/item-types/${organizationId}`) || []);
      setFoodTypes(await fetchJson(`${API_BASE}/food-types/${organizationId}`) || []);
      setCuisines(await fetchJson(`${API_BASE}/cuisines/${organizationId}`) || []);
    };
    fetchTypes();
  }, [organizationId]);

  // ---------- Fetch Addons & Customization Groups ----------
  useEffect(() => {
    if (!organizationId) return;
    const fetchData = async () => {
      setAddons(await fetchJson(`${API_BASE}/addons/${organizationId}`) || []);
      setCustomizationGroups(await fetchJson(`${API_BASE}/customization-groups/${organizationId}`) || []);
    };
    fetchData();
  }, [organizationId]);

  // ---------- Fetch Menu ----------
  useEffect(() => {
    if (!organizationId) return;
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch menu details");
        const data = await res.json();
        setMenu(data);
      } catch (err) {
        console.error("Menu fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [organizationId, id]);

  // ---------- Fetch Recommended Items ----------
  useEffect(() => {
    if (!organizationId) return;
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/organization/${organizationId}/recommended`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        return res.json();
      })
      .then((data) => Array.isArray(data) && setRecommendedItems(data))
      .catch((err) => {
        console.error("Error fetching recommended items:", err);
        setRecommendedItems([]);
      });
  }, [organizationId]);

  // ---------- Update Handler ----------
  const handleUpdate = async () => {
    if (!window.confirm("Do you want to update this menu item?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Unauthorized");

      const form = new FormData();
      form.append("organizationId", organizationId);
      form.append("itemName", menu.itemName || "");
      form.append("description", menu.description || "");
      if (menu.imageFile) form.append("image", menu.imageFile);

      const findByIdOrName = (arr, key) =>
        arr.find(
          (x) =>
            x.id?.toString() === key?.toString() ||
            x.name === key ||
            x.itemTypeName === key ||
            x.foodTypeName === key ||
            x.cuisineTypeName === key
        ) || {};

      const selectedCategory = findByIdOrName(categories, menu.categoryId);
      const selectedItemType = findByIdOrName(itemTypes, menu.itemTypeId);
      const selectedFoodType = findByIdOrName(foodTypes, menu.foodTypeId);
      const selectedCuisine = findByIdOrName(cuisines, menu.cuisineTypeId);

      form.append("categoryId", selectedCategory.id || "");
      form.append("categoryName", selectedCategory.name || "");
      form.append("itemTypeId", selectedItemType.id || "");
      form.append("itemTypeName", selectedItemType.name || selectedItemType.itemTypeName || "");
      form.append("foodTypeId", selectedFoodType.id || "");
      form.append("foodTypeName", selectedFoodType.name || selectedFoodType.foodTypeName || "");
      form.append("cuisineTypeId", selectedCuisine.id || "");
      form.append("cuisineTypeName", selectedCuisine.name || selectedCuisine.cuisineTypeName || "");

      form.append("spiceLevel", menu.spiceLevel?.toString() || "1");
      form.append("isAvailable", menu.isAvailable ? "true" : "false");
      form.append("isRecommended", menu.isRecommended ? "true" : "false");
      form.append("isBestseller", menu.isBestseller ? "true" : "false");
      form.append("chefSpecial", menu.chefSpecial ? "true" : "false");
      form.append("preparationTime", menu.preparationTime?.toString() || "1");
      form.append("allergenInfo", menu.allergenInfo || "");

      const safeVariants = Array.isArray(menu.variants) ? menu.variants : [];
      safeVariants.forEach((v, i) => {
        if (v.id) form.append(`variants[${i}].id`, v.id);
        form.append(`variants[${i}].variantName`, v.variantName || "");
        form.append(`variants[${i}].variantType`, v.variantType || "");
        form.append(`variants[${i}].price`, v.price?.toString() || "0");
        form.append(`variants[${i}].discountPrice`, v.discountPrice?.toString() || "0");
        form.append(`variants[${i}].finalPrice`, v.finalPrice?.toString() || v.price?.toString() || "0");
        form.append(`variants[${i}].isDefault`, v.isDefault ? "true" : "false");
        form.append(`variants[${i}].isAvailable`, v.isAvailable ? "true" : "false");
      });

      const safeAddons = Array.isArray(menu.availableAddons) ? menu.availableAddons : [];
      safeAddons.forEach((a, i) => {
        if (a.id) form.append(`addons[${i}].id`, a.id);
        form.append(`addons[${i}].addonName`, a.addonName || a.name || "");
        form.append(`addons[${i}].isDefault`, "false");
      });

      const safeGroups = Array.isArray(menu.customizationGroups) ? menu.customizationGroups : [];
      safeGroups.forEach((g, i) => {
        if (g.id) form.append(`customizationGroups[${i}].id`, g.id);
        form.append(`customizationGroups[${i}].name`, g.name || "");
      });

      const res = await fetch(`${API_BASE}/update/${menu.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) throw new Error(await res.text() || "Update failed");

      const data = await res.json();
      toast.success("✅ Menu updated successfully!");
      setMenu(data);
      setShowPopup(false);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("❌ Failed to update menu: " + (err.message || ""));
    }
  };

  if (loading) return <p>Loading menu details...</p>;
  if (!menu) return <p>Menu not found.</p>;

  const imageSrc = menu.imageData
    ? `data:image/jpeg;base64,${menu.imageData}`
    : menu.imageUrl
      ?.replace(/\\/g, "/")
      .replace("C:/dine-ease-backend/dine-ease/uploads/", "http://localhost:8082/dine-ease/uploads/");

  return (
    <div className="admin-menu-detail-container">
      <button className="admin-menu-detail-close-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="admin-menu-detail-header">
        <div className="admin-menu-detail-card">
          <img src={imageSrc} alt={menu.itemName} className="admin-menu-detail-image" />
        </div>

        <div className="admin-menu-detail-basic">
          <h2>{menu.itemName}</h2>
          <p>{menu.description}</p>
          <div className="admin-menu-detail-meta">
            <p><strong>Category:</strong> {menu.categoryName}</p>
            <p><strong>Item Type:</strong> {menu.itemType}</p>
            <p><strong>Food Type:</strong> {menu.foodType}</p>
            <p><strong>Cuisine:</strong> {menu.cuisineType}</p>
            <p><strong>Spice Level:</strong> {menu.spiceLevel}</p>
            <p><strong>Preparation Time:</strong> {menu.preparationTime} min</p>
            {menu.allergenInfo && <p><strong>Allergens:</strong> {menu.allergenInfo}</p>}
          </div>
          <div className="admin-menu-detail-flags">
            <span className={menu.isAvailable ? "flag green" : "flag red"}>
              {menu.isAvailable ? "Available" : "Unavailable"}
            </span>
            {menu.isRecommended && <span className="flag blue">Recommended</span>}
            {menu.isBestseller && <span className="flag gold">Bestseller</span>}
            {menu.chefSpecial && <span className="flag orange">Chef’s Special</span>}
          </div>
        </div>

        <div className="admin-menu-detail-overlay">
          <button className="edit-btn" onClick={() => setShowPopup(true)}>
            <Edit3 size={15} /> Update
          </button>
          <button
            className="delete-btn"
            onClick={async () => {
              if (!window.confirm("Are you sure you want to delete this menu item?")) return;
              try {
                const token = localStorage.getItem("token");
                if (!token) return toast.error("Unauthorized");
                const res = await fetch(`${API_BASE}/delete/${menu.id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(await res.text() || "Delete failed");
                toast.success("Menu deleted successfully!");
                navigate("/AdminDashboard/menu");
              } catch (err) {
                console.error(err);
                toast.error("Failed to delete menu");
              }
            }}
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Variants */}
      {menu.variants?.length > 0 && (
        <div className="admin-menu-detail-section">
          <h3>Variants</h3>
          <table className="admin-menu-detail-table">
            <thead>
              <tr>
                <th>Name</th><th>Type</th><th>Qty</th><th>Price</th><th>Discount</th><th>Available</th>
              </tr>
            </thead>
            <tbody>
              {menu.variants.map((v, i) => (
                <tr key={i}>
                  <td>{v.variantName}</td>
                  <td>{v.variantType}</td>
                  <td>{v.quantityValue} {v.quantityUnit}</td>
                  <td>₹{v.price}</td>
                  <td>{v.discountPrice ? `₹${v.discountPrice}` : "-"}</td>
                  <td>{v.isAvailable ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Addons */}
      {menu.availableAddons?.length > 0 && (
        <div className="admin-menu-detail-section">
          <h3>Addons</h3>
          <ul className="admin-menu-detail-list">
            {menu.availableAddons.map((a, i) => (
              <li key={i}>
                <strong>{a.name || a.addOnName}</strong> – ₹{a.price} ({a.addonType})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Customization Groups */}
      {menu.customizationGroups?.length > 0 && (
        <div className="admin-menu-detail-section">
          <h3>Customization Groups</h3>
          <ul className="admin-menu-detail-list">
            {menu.customizationGroups.map((g, i) => <li key={i}>{g.name}</li>)}
          </ul>
        </div>
      )}

      {/* Recommended Items */}
      {recommendedItems.length > 0 && (
        <div className="admin-menu-detail-section">
          <h3>Recommended Items</h3>
          <div className="admin-menu-detail-grid">
            {recommendedItems.map((item) => {
              const img = item.imageData
                ? `data:image/jpeg;base64,${item.imageData}`
                : item.imageUrl
                  ?.replace(/\\/g, "/")
                  .replace("C:/dine-ease-backend/dine-ease/uploads/", "http://localhost:8082/dine-ease/uploads/");
              return (
                <div
                  key={item.id}
                  className="admin-menu-detail-recommended-card"
                  onClick={() => navigate(`/AdminDashboard/menu/${item.id}`)}
                >
                  <img src={img} alt={item.itemName} className="admin-menu-detail-recommended-img" />
                  <h4>{item.itemName}</h4>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {showPopup && (
  <div className="popup-overlay">
    <div className="popup-container large">
      <button className="popup-close" onClick={() => setShowPopup(false)}>
        ✖
      </button>

      <h2>Edit Menu Item</h2>

      <div className="popup-content">
        {/* ---------- Basic Info ---------- */}
        <label>Item Name *</label>
        <input
          type="text"
          value={menu.itemName || ""}
          onChange={(e) => setMenu({ ...menu, itemName: e.target.value })}
          required
        />

        <label>Description</label>
        <textarea
          value={menu.description || ""}
          onChange={(e) => setMenu({ ...menu, description: e.target.value })}
        />

        {/* ---------- Category ---------- */}
        <label>Category</label>
        <select
          value={menu.categoryId || ""}
          onChange={(e) => setMenu({ ...menu, categoryId: e.target.value })}
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* ---------- Type, Food, Cuisine, Spice ---------- */}
        <div className="admin-grid-2">
          <div>
            <label>Item Type</label>
            <select
              value={menu.itemTypeId || ""}
              onChange={(e) => setMenu({ ...menu, itemTypeId: e.target.value })}
            >
              <option value="">Select item type</option>
              {itemTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.itemTypeName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Food Type</label>
            <select
              value={menu.foodTypeId || ""}
              onChange={(e) => setMenu({ ...menu, foodTypeId: e.target.value })}
            >
              <option value="">Select food type</option>
              {foodTypes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.foodTypeName || f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Cuisine</label>
            <select
              value={menu.cuisineTypeId || ""}
              onChange={(e) =>
                setMenu({ ...menu, cuisineTypeId: e.target.value })
              }
            >
              <option value="">Select cuisine</option>
              {cuisines.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Spice Level</label>
            <input
              type="number"
              min={1}
              max={5}
              value={menu.spiceLevel || 1}
              onChange={(e) =>
                setMenu({ ...menu, spiceLevel: Number(e.target.value) })
              }
            />
          </div>
        </div>

        {/* ---------- Image Upload ---------- */}
        <label>Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setMenu({ ...menu, imageFile: e.target.files?.[0] || null })
          }
        />
        {menu.imageData && (
          <img
            src={`data:image/jpeg;base64,${menu.imageData}`}
            alt="preview"
            className="admin-menu-preview"
          />
        )}

        {/* ---------- Variants ---------- */}
        <h4>Variants</h4>
        {menu.variants?.map((v, i) => (
          <div key={i} className="admin-menu-variant-row">
            <input
              value={v.variantName || ""}
              placeholder="Variant Name"
              onChange={(e) => {
                const updated = [...menu.variants];
                updated[i].variantName = e.target.value;
                setMenu({ ...menu, variants: updated });
              }}
            />

            <select
              value={v.variantType || ""}
              onChange={(e) => {
                const updated = [...menu.variants];
                updated[i].variantType = e.target.value;
                setMenu({ ...menu, variants: updated });
              }}
            >
              <option value="">Select Type</option>
              <option value="SIZE">Size</option>
              <option value="PORTION">Portion</option>
              <option value="FLAVOR">Flavor</option>
              <option value="QUANTITY">Quantity</option>
            </select>

            <input
              type="number"
              value={v.quantityValue || ""}
              placeholder="Quantity Value"
              onChange={(e) => {
                const updated = [...menu.variants];
                updated[i].quantityValue = e.target.value;
                setMenu({ ...menu, variants: updated });
              }}
            />

            <input
              value={v.quantityUnit || ""}
              placeholder="Unit (e.g., g/ml)"
              onChange={(e) => {
                const updated = [...menu.variants];
                updated[i].quantityUnit = e.target.value;
                setMenu({ ...menu, variants: updated });
              }}
            />

            <input
              type="number"
              value={v.price || ""}
              placeholder="Price"
              onChange={(e) => {
                const updated = [...menu.variants];
                updated[i].price = e.target.value;
                setMenu({ ...menu, variants: updated });
              }}
            />

            <input
              type="number"
              value={v.discountPrice || ""}
              placeholder="Discount Price"
              onChange={(e) => {
                const updated = [...menu.variants];
                updated[i].discountPrice = e.target.value;
                setMenu({ ...menu, variants: updated });
              }}
            />

            <label>
              Default{" "}
              <input
                type="checkbox"
                checked={v.isDefault || false}
                onChange={(e) => {
                  const updated = [...menu.variants];
                  updated[i].isDefault = e.target.checked;
                  setMenu({ ...menu, variants: updated });
                }}
              />
            </label>

            <label>
              Available{" "}
              <input
                type="checkbox"
                checked={v.isAvailable || false}
                onChange={(e) => {
                  const updated = [...menu.variants];
                  updated[i].isAvailable = e.target.checked;
                  setMenu({ ...menu, variants: updated });
                }}
              />
            </label>

            <button
              className="variant-remove-btn"
              onClick={() => {
                const updated = menu.variants.filter((_, idx) => idx !== i);
                setMenu({ ...menu, variants: updated });
              }}
            >
              Remove
            </button>
          </div>
        ))}

        <button
          className="variant-add-btn"
          onClick={() =>
            setMenu({
              ...menu,
              variants: [
                ...(menu.variants || []),
                {
                  variantName: "",
                  variantType: "",
                  quantityValue: "",
                  quantityUnit: "",
                  price: "",
                  discountPrice: "",
                  isDefault: false,
                  isAvailable: true,
                },
              ],
            })
          }
        >
          + Add Variant
        </button>

        {/* ---------- Flags ---------- */}
        <div className="admin-menu-grid-2">
          <label>
            <input
              type="checkbox"
              checked={menu.isAvailable || false}
              onChange={(e) => setMenu({ ...menu, isAvailable: e.target.checked })}
            />{" "}
            Available
          </label>
          <label>
            <input
              type="checkbox"
              checked={menu.isRecommended || false}
              onChange={(e) =>
                setMenu({ ...menu, isRecommended: e.target.checked })
              }
            />{" "}
            Recommended
          </label>
          <label>
            <input
              type="checkbox"
              checked={menu.isBestseller || false}
              onChange={(e) =>
                setMenu({ ...menu, isBestseller: e.target.checked })
              }
            />{" "}
            Bestseller
          </label>
          <label>
            <input
              type="checkbox"
              checked={menu.chefSpecial || false}
              onChange={(e) =>
                setMenu({ ...menu, chefSpecial: e.target.checked })
              }
            />{" "}
            Chef’s Special
          </label>
        </div>

        {/* ---------- Preparation & Allergen Info ---------- */}
        <label>Preparation Time (minutes)</label>
        <input
          type="number"
          value={menu.preparationTime || ""}
          onChange={(e) =>
            setMenu({ ...menu, preparationTime: e.target.value })
          }
        />

        <label>Allergen Info</label>
        <input
          type="text"
          value={menu.allergenInfo || ""}
          onChange={(e) => setMenu({ ...menu, allergenInfo: e.target.value })}
        />

        {/* ---------- Addons Section ---------- */}
        <h4>Addons</h4>
        <select
          className="admin-addon-select"
          value=""
          onChange={(e) => {
            const selectedId = e.target.value;
            if (!selectedId) return;

            const selectedAddon = addons.find(
              (a) => (a.id || a.addOnId).toString() === selectedId
            );

            if (
              selectedAddon &&
              !menu.availableAddons?.some(
                (item) =>
                  (item.id || item.addOnId) ===
                  (selectedAddon.id || selectedAddon.addOnId)
              )
            ) {
              setMenu({
                ...menu,
                availableAddons: [
                  ...(menu.availableAddons || []),
                  selectedAddon,
                ],
              });
            }
          }}
        >
          <option value="">Select Addon</option>
          {addons.map((a) => (
            <option key={a.addOnId || a.id} value={a.id || a.addOnId}>
              {a.addOnName || a.name}
            </option>
          ))}
        </select>

        <div className="admin-addon-section">
          <label>Selected Addons</label>
          <div className="admin-addon-box">
            {menu.availableAddons?.length > 0 ? (
              <div className="admin-addon-grid">
                {menu.availableAddons.map((a) => (
                  <span key={a.id || a.addOnId} className="admin-addon-tag">
                    {a.addOnName || a.name}
                    <button
                      type="button"
                      className="admin-addon-remove-btn"
                      onClick={() => {
                        const updated = menu.availableAddons.filter(
                          (item) =>
                            (item.id || item.addOnId) !==
                            (a.id || a.addOnId)
                        );
                        setMenu({ ...menu, availableAddons: updated });
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="admin-addon-empty">No addons selected</p>
            )}
          </div>
        </div>

        {/* ---------- Customization Groups Section ---------- */}
        <h4>Customization Groups</h4>
        <select
          className="admin-customize-select"
          value=""
          onChange={(e) => {
            const selectedName = e.target.value;
            if (!selectedName) return;

            if (!menu.customizationGroups?.includes(selectedName)) {
              setMenu({
                ...menu,
                customizationGroups: [
                  ...(menu.customizationGroups || []),
                  selectedName,
                ],
              });
            }
          }}
        >
          <option value="">Select Customization Group</option>
          {customizationGroups.map((g) => (
            <option
              key={g.id || g.customizationGroupId}
              value={g.name || g.groupName}
            >
              {g.name || g.groupName}
            </option>
          ))}
        </select>

        <div className="admin-customize-section">
          <label>Selected Customization Groups</label>
          <div className="admin-customize-box">
            {menu.customizationGroups?.length > 0 ? (
              <div className="admin-customize-grid">
                {menu.customizationGroups.map((name) => (
                  <span key={name} className="admin-customize-tag">
                    {name}
                    <button
                      type="button"
                      className="admin-customize-remove-btn"
                      onClick={() => {
                        const updated = menu.customizationGroups.filter(
                          (n) => n !== name
                        );
                        setMenu({ ...menu, customizationGroups: updated });
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="admin-customize-empty">
                No customization groups selected
              </p>
            )}
          </div>
        </div>

        {/* ---------- Actions ---------- */}
        <div className="admin-menu-modal-actions">
          <button type="submit" className="admin-menu-save-btn">
            Save Menu
          </button>
          <button
            type="button"
            className="admin-menu-cancel-btn"
            onClick={() => setShowPopup(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}
</div>
  );
}

