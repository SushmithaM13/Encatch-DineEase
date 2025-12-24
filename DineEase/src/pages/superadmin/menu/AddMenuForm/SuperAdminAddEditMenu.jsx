
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getMenuById,
  getMenuDropdowns,
  buildMenuFormData,
  addMenu,
  updateMenu,
} from "./Api/menuApi";
import { Minus } from "lucide-react";
import "./SuperAdminAddEditMenu.css";

export default function SuperAdminAddEditMenu() {
  const navigate = useNavigate();
  const { menuId } = useParams();
  const isEdit = Boolean(menuId);

  const handleBack = () => {
    if (window.history.state && window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/SuperadminDashboard/menu"); // fallback route
    }
  };

  const [orgId, setOrgId] = useState(null);
  const [dropdowns, setDropdowns] = useState({
    categories: [],
    itemTypes: [],
    foodTypes: [],
    cuisines: [],
    addons: [],
    groups: [],
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [menu, setMenu] = useState({
    organizationId: "",
    category: { id: "", categoryName: "" },
    itemType: { id: "", itemTypeName: "" },
    foodType: { id: "", foodTypeName: "" },
    cuisine: { id: "", cuisineTypeName: "" },
    categoryName: "",
    itemTypeName: "",
    foodTypeName: "",
    cuisineTypeName: "",
    itemName: "",
    description: "",
    spiceLevel: 1,
    preparationTime: 1,
    allergenInfo: "",
    isAvailable: true,
    isRecommended: false,
    isBestseller: false,
    chefSpecial: false,
    variants: [],
    addons: [],
    customizationGroupNames: [],
  });

  // Load orgId from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("organizationId");
    if (stored) {
      setOrgId(stored);
      setMenu((prev) => ({ ...prev, organizationId: stored }));
    } else {
      // don't alert aggressively here; user may be redirected before
      console.warn("Organization ID not found in localStorage");
    }
  }, []);

  // Load dropdowns (use orgId state, or fall back to localStorage)
  useEffect(() => {
    const effectiveOrgId = orgId || localStorage.getItem("organizationId");
    if (!effectiveOrgId) return;

    async function loadDropdowns() {
      try {
        const data = await getMenuDropdowns(effectiveOrgId);
        setDropdowns(data || {
          categories: [],
          itemTypes: [],
          foodTypes: [],
          cuisines: [],
          addons: [],
          groups: [],
        });
      } catch (err) {
        console.error("Failed to load dropdowns:", err);
      }
    }
    loadDropdowns();
  }, [orgId]);

  // Load menu in edit mode. We read orgId from localStorage as fallback so organizationId is never null.
  useEffect(() => {
    if (!isEdit) return;

    async function loadEditData() {
      try {
        const data = await getMenuById(menuId);

        // Prefer orgId state (if available), otherwise use localStorage, otherwise use data.organizationId
        const storedOrgId = orgId || localStorage.getItem("organizationId") || data.organizationId || "";

        // ensure orgId state set (useful for dropdown loading)
        if (!orgId && storedOrgId) setOrgId(storedOrgId);

        setMenu({
          organizationId: storedOrgId,
          category: { id: data.categoryId ?? "", categoryName: data.categoryName ?? "" },
          itemType: { id: data.itemTypeId ?? "", itemTypeName: data.itemTypeName ?? "" },
          foodType: { id: data.foodTypeId ?? "", foodTypeName: data.foodTypeName ?? "" },
          cuisine: { id: data.cuisineTypeId ?? "", cuisineTypeName: data.cuisineTypeName ?? "" },
          categoryName: data.categoryName ?? "",
          itemTypeName: data.itemTypeName ?? "",
          foodTypeName: data.foodTypeName ?? "",
          cuisineTypeName: data.cuisineTypeName ?? "",
          itemName: data.itemName ?? "",
          description: data.description ?? "",
          spiceLevel: data.spiceLevel ?? 1,
          preparationTime: data.preparationTime ?? 1,
          allergenInfo: data.allergenInfo ?? "",
          isAvailable: typeof data.isAvailable === "boolean" ? data.isAvailable : true,
          isRecommended: typeof data.isRecommended === "boolean" ? data.isRecommended : false,
          isBestseller: typeof data.isBestseller === "boolean" ? data.isBestseller : false,
          chefSpecial: typeof data.chefSpecial === "boolean" ? data.chefSpecial : false,
          variants: data.variants || [],
          addons: data.addons || [],
          customizationGroupNames: data.customizationGroupNames || [],
        });

        // set image preview (backend may return imageUrl or imageData)
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
        } else if (data.imageData) {
          setImagePreview(`data:image/jpeg;base64,${data.imageData}`);
        }
      } catch (err) {
        console.error("Error loading menu:", err);
        alert("Failed to load menu");
      }
    }

    loadEditData();
    // intentionally not depending on orgId here (we read from localStorage inside) to avoid missing load
  }, [isEdit, menuId]);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setMenu((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addVariant = () => {
    setMenu((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          variantName: "",
          variantType: "",
          quantityUnit: "",
          displayOrder: 0,
          price: 0,
          discountPrice: 0,
          isDefault: false,
          isAvailable: true,
        },
      ],
    }));
  };

  const updateVariant = (i, field, value) => {
    const updated = [...menu.variants];
    updated[i] = { ...updated[i], [field]: value };
    setMenu((prev) => ({ ...prev, variants: updated }));
  };

  const removeVariant = (i) => {
    setMenu((prev) => ({ ...prev, variants: prev.variants.filter((_, idx) => idx !== i) }));
  };

  const addAddon = (addon) => {
    if (!menu.addons.some((a) => a.id === addon.id)) {
      setMenu((prev) => ({ ...prev, addons: [...prev.addons, addon] }));
    }
  };

  const removeAddon = (addon) => {
    setMenu((prev) => ({ ...prev, addons: prev.addons.filter((a) => a.id !== addon.id) }));
  };

  const addGroup = (groupName) => {
    if (!menu.customizationGroupNames.includes(groupName)) {
      setMenu((prev) => ({
        ...prev,
        customizationGroupNames: [...prev.customizationGroupNames, groupName],
      }));
    }
  };

  const removeGroup = (name) => {
    setMenu((prev) => ({
      ...prev,
      customizationGroupNames: prev.customizationGroupNames.filter((n) => n !== name),
    }));
  };

  const handleSubmit = async () => {
  try {
    const effectiveOrgId = orgId || localStorage.getItem("organizationId");
    if (!effectiveOrgId) {
      alert("Organization ID not found.");
      return;
    }

    if (isEdit) {
      // Update menu
      await updateMenu({ ...menu, organizationId: effectiveOrgId, menuItemId: menuId, imageFile });
      alert("Menu updated successfully!");

      // Redirect to the details page with updated menu data
      navigate(`/SuperAdminDashboard/menu/details/${menuId}`);
    } else {
      // Add new menu
      const formData = buildMenuFormData({ ...menu, organizationId: effectiveOrgId }, imageFile);
      const addedMenu = await addMenu(formData);
      alert("Menu added successfully!");
      navigate("/SuperAdminDashboard/menu"); // go to menu list after adding
    }
  } catch (err) {
    console.error(err);
    alert("Failed to save menu: " + (err?.response?.data?.message || err.message));
  }
};


  // ---------------- UI ----------------
  return (
    <div className="Superadmin-add-edit-menu-page">
      <div className="Superadmin-add-edit-menu-page-header">
        <h2>{isEdit ? "Edit Menu Item" : "Add New Menu Item"}</h2>
        <button className="back-btn" onClick={handleBack}>
          ← Back
        </button>
      </div>

      <div className="Superadmin-add-edit-menu-form-wrapper">
        {/* BASIC DETAILS */}
        <div className="Superadmin-add-edit-menu-section-card">
          <h3>Basic Details</h3>

          <div className="Superadmin-add-edit-menu-form-grid">
            {/* Item Name */}
            <div>
              <label>Item Name</label>
              <input name="itemName" value={menu.itemName} onChange={handleInput} placeholder="Enter item name" />
            </div>

            {/* Category */}
            <div>
              <label>Category</label>
              <select
                value={menu.category.id}
                onChange={(e) => {
                  const id = e.target.value;
                  const obj = dropdowns.categories.find((c) => c.id.toString() === id);

                  setMenu((prev) => ({
                    ...prev,
                    category: {
                      id,
                      categoryName: obj?.categoryName || "",
                    },
                    categoryName: obj?.categoryName || "",
                  }));
                }}
              >
                <option value="">Select</option>
                {dropdowns.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="Superadmin-add-edit-full">
              <label>Description</label>
              <textarea name="description" value={menu.description} onChange={handleInput} />
            </div>

            {/* Item Type */}
            <div>
              <label>Item Type</label>
              <select
                value={menu.itemType.id}
                onChange={(e) => {
                  const id = e.target.value;
                  const obj = dropdowns.itemTypes.find((t) => t.id.toString() === id);

                  setMenu((prev) => ({
                    ...prev,
                    itemType: {
                      id,
                      itemTypeName: obj?.itemTypeName || "",
                    },
                    itemTypeName: obj?.itemTypeName || "",
                  }));
                }}
              >
                <option value="">Select</option>
                {dropdowns.itemTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.itemTypeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Food Type */}
            <div>
              <label>Food Type</label>
              <select
                value={menu.foodType.id}
                onChange={(e) => {
                  const id = e.target.value;
                  const obj = dropdowns.foodTypes.find((t) => t.id.toString() === id);

                  setMenu((prev) => ({
                    ...prev,
                    foodType: {
                      id,
                      foodTypeName: obj?.foodTypeName || "",
                    },
                    foodTypeName: obj?.foodTypeName || "",
                  }));
                }}
              >
                <option value="">Select</option>
                {dropdowns.foodTypes.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.foodTypeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Cuisine */}
            <div>
              <label>Cuisine</label>
              <select
                value={menu.cuisine.id}
                onChange={(e) => {
                  const id = e.target.value;
                  const obj = dropdowns.cuisines.find((t) => t.id.toString() === id);

                  setMenu((prev) => ({
                    ...prev,
                    cuisine: {
                      id,
                      cuisineTypeName: obj?.cuisineTypeName || "",
                    },
                    cuisineTypeName: obj?.cuisineTypeName || "",
                  }));
                }}
              >
                <option value="">Select</option>
                {dropdowns.cuisines.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cuisineTypeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* IMAGE */}
        <div className="Superadmin-add-edit-menu-section-card">
          <h3>Image</h3>
          <input type="file" accept="image/*" onChange={handleImage} />
          {imagePreview && <img src={imagePreview} className="Superadmin-add-edit-menu-preview-img" alt="preview" />}
        </div>

        {/* VARIANTS */}
        <div className="Superadmin-add-edit-menu-section-card">
          <h4>Variants</h4>

          {menu.variants.map((v, i) => (
            <div key={i} className="Superadmin-menu-variant-row">
              <div className="variant-input">
                <label>Variant Name</label>
                <input value={v.variantName} onChange={(e) => updateVariant(i, "variantName", e.target.value)} />
              </div>

              <div className="variant-input">
                <label>Variant Type</label>
                <select value={v.variantType} onChange={(e) => updateVariant(i, "variantType", e.target.value)}>
                  <option value="">Select</option>
                  <option value="SIZE">Size</option>
                  <option value="PORTION">Portion</option>
                  <option value="TEMPERATURE">Temperature</option>
                  <option value="QUANTITY">Quantity</option>
                  <option value="PACKAGING">Packaging</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>

              <div className="variant-input">
                <label>Qty Unit</label>
                <input value={v.quantityUnit} onChange={(e) => updateVariant(i, "quantityUnit", e.target.value)} />
              </div>

              <div className="variant-input">
                <label>Price</label>
                <input type="number" value={v.price} onChange={(e) => updateVariant(i, "price", Number(e.target.value))} />
              </div>

              <div className="variant-input">
                <label>Discount</label>
                <input type="number" value={v.discountPrice} onChange={(e) => updateVariant(i, "discountPrice", Number(e.target.value))} />
              </div>

              <div className="variant-input">
                <label>Order</label>
                <input type="number" value={v.displayOrder} onChange={(e) => updateVariant(i, "displayOrder", Number(e.target.value))} />
              </div>

              <button onClick={() => removeVariant(i)}>
                <Minus size={14} />
              </button>
            </div>
          ))}

          <button className="Superadmin-add-edit-menu-add-variant-btn" onClick={addVariant}>
            + Add Variant
          </button>
        </div>

        {/* ADDONS */}
        <div className="Superadmin-add-edit-menu-section-card">
          <h3>Addons</h3>

          <select
            value=""
            onChange={(e) => {
              const obj = dropdowns.addons.find((a) => a.id.toString() === e.target.value);
              if (obj) addAddon(obj);
            }}
          >
            <option value="">Select Addon</option>
            {dropdowns.addons.map((a) => (
              <option key={a.id} value={a.id}>
                {a.addonName}
              </option>
            ))}
          </select>

          <div className="Superadmin-addon-box">
            {menu.addons.map((a) => (
              <span key={a.id} className="Superadmin-addon-tag">
                {a.addonName}
                <button onClick={() => removeAddon(a)}>✕</button>
              </span>
            ))}
          </div>
        </div>

        {/* GROUPS */}
        <div className="Superadmin-add-edit-menu-section-card">
          <h3>Customization Groups</h3>

          <select value="" onChange={(e) => addGroup(e.target.value)}>
            <option value="">Select</option>
            {dropdowns.groups.map((g) => (
              <option key={g.id} value={g.groupName}>
                {g.groupName}
              </option>
            ))}
          </select>

          <div className="Superadmin-customize-box">
            {menu.customizationGroupNames.map((g) => (
              <span key={g} className="Superadmin-customize-tag">
                {g}
                <button onClick={() => removeGroup(g)}>✕</button>
              </span>
            ))}
          </div>
        </div>

        <button className="Superadmin-add-edit-menu-save-btn" onClick={handleSubmit}>
          {isEdit ? "Update Menu" : "Add Menu"}
        </button>
      </div>
    </div>
  );
}
