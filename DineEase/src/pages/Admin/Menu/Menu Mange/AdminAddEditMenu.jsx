import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { fetchProfile, getMenuById, getMenuDropdowns, addMenu, updateMenu } from "./Api/menuApi";

import { X } from "lucide-react";
import "./AdminAddEditMenu.css";

export default function AdminAddEditMenu() {
  const navigate = useNavigate();
  const { menuId } = useParams();
  const isEdit = Boolean(menuId);

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
    menuItemId: "",

    // object + name copies for backend
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

  // ---------------- LOAD PROFILE ----------------
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await fetchProfile();
        if (!profile) return;
        setOrgId(profile.organizationId);

        setMenu((prev) => ({
          ...prev,
          organizationId: profile.organizationId,
        }));
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    }
    loadProfile();
  }, []);

  // ---------------- LOAD DROPDOWNS ----------------
  useEffect(() => {
    if (!orgId) return;

    async function loadDropdowns() {
      try {
        const data = await getMenuDropdowns(orgId);
        // ensure keys exist (backwards compatibility)
        setDropdowns({
          categories: data.categories || [],
          itemTypes: data.itemTypes || [],
          foodTypes: data.foodTypes || [],
          cuisines: data.cuisines || [],
          addons: data.addons || [],
          groups: data.groups || [],
        });
      } catch (err) {
        console.error("Failed to load dropdowns:", err);
      }
    }
    loadDropdowns();
  }, [orgId]);

  // ---------------- LOAD MENU FOR EDIT ----------------
 useEffect(() => {
  async function loadEditData() {
    if (!isEdit || !orgId) return;

    // Wait until dropdowns are loaded
    if (!dropdowns.categories.length ||
        !dropdowns.itemTypes.length ||
        !dropdowns.foodTypes.length ||
        !dropdowns.cuisines.length) return;

    try {
      const data = await getMenuById(menuId);
      if (!data) return;

      const findByIdOrName = (arr, id, name, idKey, nameKey) =>
        arr.find(x => String(x[idKey]) === String(id) || x[nameKey] === name) || {};

      const resolvedCategory = findByIdOrName(dropdowns.categories, data.category?.id, data.categoryName, "id", "categoryName");
      const resolvedItemType = findByIdOrName(dropdowns.itemTypes, data.itemType?.id, data.itemTypeName, "id", "itemTypeName");
      const resolvedFoodType = findByIdOrName(dropdowns.foodTypes, data.foodType?.id, data.foodTypeName, "id", "foodTypeName");
      const resolvedCuisine = findByIdOrName(dropdowns.cuisines, data.cuisine?.id, data.cuisineTypeName, "id", "cuisineTypeName");

      setMenu(prev => ({
        ...prev,
        menuItemId: data.menuItemId,
        organizationId: data.organizationId || orgId,

        category: { id: resolvedCategory.id || "", categoryName: resolvedCategory.categoryName || data.categoryName || "" },
        categoryName: resolvedCategory.categoryName || data.categoryName || "",

        itemType: { id: resolvedItemType.id || "", itemTypeName: resolvedItemType.itemTypeName || data.itemTypeName || "" },
        itemTypeName: resolvedItemType.itemTypeName || data.itemTypeName || "",

        foodType: { id: resolvedFoodType.id || "", foodTypeName: resolvedFoodType.foodTypeName || data.foodTypeName || "" },
        foodTypeName: resolvedFoodType.foodTypeName || data.foodTypeName || "",

        cuisine: { id: resolvedCuisine.id || "", cuisineTypeName: resolvedCuisine.cuisineTypeName || data.cuisineTypeName || "" },
        cuisineTypeName: resolvedCuisine.cuisineTypeName || data.cuisineTypeName || "",

        itemName: data.itemName || "",
        description: data.description || "",
        spiceLevel: data.spiceLevel || 1,
        preparationTime: data.preparationTime || 1,
        allergenInfo: data.allergenInfo || "",
        isAvailable: data.isAvailable ?? true,
        isRecommended: data.isRecommended ?? false,
        isBestseller: data.isBestseller ?? false,
        chefSpecial: data.chefSpecial ?? false,

        variants: data.variants || [],
        addons: data.addons || [],
        customizationGroupNames: data.customizationGroups || [],
        imageData: data.imageData ?? null,
      }));
    } catch (err) {
      console.error("Error loading menu:", err);
    }
  }

  loadEditData();
}, [isEdit, orgId, menuId, dropdowns]);

 
  // =============== DROPDOWN HANDLERS =====================
  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (!val) {
      // clear selection
      setMenu((prev) => ({
        ...prev,
        category: { id: "", categoryName: "" },
        categoryName: "",
      }));
      return;
    }
    const selected = dropdowns.categories.find((c) => String(c.id) === String(val));
    if (!selected) return;
    setMenu((prev) => ({
      ...prev,
      category: { id: selected.id, categoryName: selected.categoryName },
      categoryName: selected.categoryName,
    }));
  };

  const handleItemTypeChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setMenu((prev) => ({
        ...prev,
        itemType: { id: "", itemTypeName: "" },
        itemTypeName: "",
      }));
      return;
    }
    const selected = dropdowns.itemTypes.find((c) => String(c.id) === String(val));
    if (!selected) return;
    setMenu((prev) => ({
      ...prev,
      itemType: { id: selected.id, itemTypeName: selected.itemTypeName },
      itemTypeName: selected.itemTypeName,
    }));
  };

  const handleFoodTypeChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setMenu((prev) => ({
        ...prev,
        foodType: { id: "", foodTypeName: "" },
        foodTypeName: "",
      }));
      return;
    }
    const selected = dropdowns.foodTypes.find((c) => String(c.id) === String(val));
    if (!selected) return;
    setMenu((prev) => ({
      ...prev,
      foodType: { id: selected.id, foodTypeName: selected.foodTypeName },
      foodTypeName: selected.foodTypeName,
    }));
  };

  const handleCuisineChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setMenu((prev) => ({
        ...prev,
        cuisine: { id: "", cuisineTypeName: "" },
        cuisineTypeName: "",
      }));
      return;
    }
    const selected = dropdowns.cuisines.find((c) => String(c.id) === String(val));
    if (!selected) return;
    setMenu((prev) => ({
      ...prev,
      cuisine: { id: selected.id, cuisineTypeName: selected.cuisineTypeName },
      cuisineTypeName: selected.cuisineTypeName,
    }));
  };

  // ---------------- INPUT HANDLING ----------------
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;

    setMenu((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview for UI
    setImagePreview(URL.createObjectURL(file));

    // Convert to Base64 for update payload (like Add-On)
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1]; // remove prefix
      setImageFile({
        file,
        _base64: base64,
      });
    };
    reader.readAsDataURL(file);
  };
  // ---------------- VARIANTS ----------------
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
          discountPercentage: 0,
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
  const variantTypeInfo = {
    SIZE: "Examples: Small, Medium, Large, Half, Full, 250ml, 500ml, 1L, Single Scoop, Double Scoop",
    PORTION: "Examples: 1 piece, 2 pieces, 1 plate, 2 plates, Extra portion",
    TEMPERATURE: "Examples: Hot, Cold, Iced, Warm, Room Temperature",
    QUANTITY: "Examples: 1kg, 2kg, 5kg, 6 pcs, 12 pcs, 100g, 250g",
    PACKAGING: "Examples: Dine-in, Takeaway, Parcel, Box, Bag, Eco pack",
    CUSTOM: "Examples: Sweetness level, Spice level, Cooking style, Bread type",
  };


  const removeVariant = (i) => {
    setMenu((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== i),
    }));
  };

  // ---------------- ADDONS ----------------
  const addAddon = (addon) => {
    const newAddon = {
      addonId: addon.addonId ?? addon.id,
      addonName: addon.addonName ?? addon.name,
      isDefault: addon.isDefault ?? false,
      maxQuantity: addon.maxQuantity ?? 1,
    };

    setMenu((prev) => {
      let updatedAddons = [...prev.addons];

      // Avoid duplicates
      if (!updatedAddons.some((a) => a.addonId === newAddon.addonId)) {
        updatedAddons.push(newAddon);
      }

      // If the added addon is default → remove default from all others
      if (newAddon.isDefault) {
        updatedAddons = updatedAddons.map((a) => ({
          ...a,
          isDefault: a.addonId === newAddon.addonId,
        }));
      }

      return { ...prev, addons: updatedAddons };
    });
  };


  const removeAddon = (addon) => {
    setMenu((prev) => ({
      ...prev,
      addons: prev.addons.filter((a) => a.addonId !== addon.addonId),
    }));
  };

  const updateAddon = (addonId, field, value) => {
    const updated = [...menu.addons];
    updated.forEach((a) => {
      if (a.addonId === addonId) {
        a[field] = value;
      }
    });

    // SPECIAL CASE → only ONE default allowed
    if (field === "isDefault" && value === true) {
      updated.forEach((a) => {
        if (a.addonId !== addonId) a.isDefault = false;
      });
    }

    setMenu((prev) => ({ ...prev, addons: updated }));
  };



  // ---------------- GROUPS ----------------
  const addGroup = (groupName) => {
    if (!groupName) return;
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

  // ---------------- SUBMIT ADD/UPDATE ----------------
  // ---------------- SUBMIT ADD/UPDATE ----------------
  const handleSubmit = async () => {
    try {
      // ✅ VALIDATE REQUIRED DROPDOWNS
      if (!menu.category?.id) return alert("Please select a valid Category");
      if (!menu.itemType?.id) return alert("Please select a valid Item Type");
      if (!menu.foodType?.id) return alert("Please select a valid Food Type");
      if (!menu.cuisine?.id) return alert("Please select a valid Cuisine");

      const payload = {
        menuItemId: menu.menuItemId || null,
        organizationId: menu.organizationId || orgId,
        categoryId: menu.category.id,
        itemTypeId: menu.itemType.id,
        foodTypeId: menu.foodType.id,
        cuisineTypeId: menu.cuisine.id,

        categoryName: menu.categoryName || menu.category.categoryName,
        itemTypeName: menu.itemTypeName || menu.itemType.itemTypeName,
        foodTypeName: menu.foodTypeName || menu.foodType.foodTypeName,
        cuisineTypeName: menu.cuisineTypeName || menu.cuisine.cuisineTypeName,

        itemName: menu.itemName,
        description: menu.description,
        spiceLevel: Number(menu.spiceLevel) || 1,
        preparationTime: Number(menu.preparationTime) || 1,
        allergenInfo: menu.allergenInfo || "",

        isAvailable: Boolean(menu.isAvailable),
        isRecommended: Boolean(menu.isRecommended),
        isBestseller: Boolean(menu.isBestseller),
        chefSpecial: Boolean(menu.chefSpecial),

        variants: (menu.variants || []).map(v => ({
          variantId: v.variantId || null,
          variantName: v.variantName,
          variantType: v.variantType,
          quantityUnit: v.quantityUnit || "",
          displayOrder: Number(v.displayOrder) || 0,
          price: Number(v.price) || 0,
          discountPercentage: Number(v.discountPercentage) || 0,
          isDefault: Boolean(v.isDefault),
          isAvailable: Boolean(v.isAvailable),
        })),

        addons: (menu.addons || []).map(a => ({
          addonName: a.addonName,
          isDefault: Boolean(a.isDefault),
          maxQuantity: Number(a.maxQuantity) || 1,
        })),

        customizationGroupNames: menu.customizationGroupNames || [],
        imageData: imageFile?._base64 || menu.imageData || null,
      };

      if (menu.menuItemId) {
        await updateMenu(payload);
        alert("Menu updated successfully!");
      } else {
        await addMenu(payload, imageFile);
        alert("Menu added successfully!");
      }

      navigate("/AdminDashboard/menu");
    } catch (err) {
      console.error(err);
      alert("Failed to submit menu.");
    }
  };
  // ---------------- UI ----------------
  return (
    <div className="admin-add-edit-menu-page">
      <div className="admin-add-edit-menu-page-header">
        <h2>{isEdit ? "Edit Menu Item" : "Add New Menu Item"}</h2>
        <button className="admin-add-edit-back-btn" onClick={() => navigate("/AdminDashboard/menu")}>
          ← Back
        </button>
      </div>

      <div className="admin-add-edit-menu-form-wrapper">
        {/* BASIC DETAILS */}
        <div className="admin-add-edit-menu-section-card">
          <h3>Basic Details</h3>
          <div className="admin-add-edit-menu-form-grid">
            <div>
              <label>Item Name</label>
              <input name="itemName" value={menu.itemName} onChange={handleInput} placeholder="Enter item name" />
            </div>

            <div className="admin-add-edit-full">
              <label>Description</label>
              <textarea name="description" value={menu.description} onChange={handleInput} />
            </div>
            <div>
              <label>Category</label>
              {dropdowns.categories.length > 0 ? (
                <select value={menu.category.id || ""} onChange={handleCategoryChange}>
                  <option value="">Select Category</option>
                  {dropdowns.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              ) : (
                <span>Loading categories...</span>
              )}
            </div>

            <div>
              <label>Item Type</label>
              {dropdowns.itemTypes.length > 0 ? (
                <select value={menu.itemType.id || ""} onChange={handleItemTypeChange}>
                  <option value="">Select Item Type</option>
                  {dropdowns.itemTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.itemTypeName}
                    </option>
                  ))}
                </select>
              ) : (
                <span>Loading item types...</span>
              )}
            </div>

            <div>
              <label>Food Type</label>
              {dropdowns.foodTypes.length > 0 ? (
                <select value={menu.foodType.id || ""} onChange={handleFoodTypeChange}>
                  <option value="">Select Food Type</option>
                  {dropdowns.foodTypes.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.foodTypeName}
                    </option>
                  ))}
                </select>
              ) : (
                <span>Loading food types...</span>
              )}
            </div>

            <div>
              <label>Cuisine</label>
              {dropdowns.cuisines.length > 0 ? (
                <select value={menu.cuisine.id || ""} onChange={handleCuisineChange}>
                  <option value="">Select Cuisine</option>
                  {dropdowns.cuisines.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cuisineTypeName}
                    </option>
                  ))}
                </select>
              ) : (
                <span>Loading cuisines...</span>
              )}
            </div>

          </div>
        </div>

        {/* IMAGE */}
        <div className="admin-add-edit-menu-section-card">
          <h3>Image</h3>
          <input type="file" accept="image/*" onChange={handleImage} />
          {imagePreview && <img src={imagePreview} className="admin-add-edit-menu-preview-img" alt="preview" />}
        </div>
        {/* ADDITIONAL DETAILS */}
        <div className="admin-add-edit-menu-section-card">
          <h3>Additional Details</h3>

          <div className="admin-add-edit-menu-form-grid">

            {/* Spice Level */}
            <div>
              <label>Spice Level (1–5)</label>
              <input
                type="text"
                name="spiceLevel"
                placeholder="Enter spice level (1–5)"
                value={menu.spiceLevel === 1 ? "" : menu.spiceLevel}
                onChange={handleInput}
              />

            </div>

            {/* Preparation Time */}
            <div>
              <label>Preparation Time (mins)</label>
              <input
                type="text"
                name="preparationTime"
                placeholder="Enter time in minutes"
                value={menu.preparationTime === 1 ? "" : menu.preparationTime}
                onChange={handleInput}
              />
            </div>


            {/* Allergen Info */}
            <div className="admin-add-edit-full">
              <label>Allergen Information</label>
              <input
                type="text"
                name="allergenInfo"
                value={menu.allergenInfo}
                onChange={handleInput}
                placeholder="Eg: Contains nuts, dairy, gluten"
              />
            </div>

            {/* Flags */}
            <div className="admin-checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={menu.isAvailable}
                  onChange={handleInput}
                />
                Available
              </label>

              <label>
                <input
                  type="checkbox"
                  name="isRecommended"
                  checked={menu.isRecommended}
                  onChange={handleInput}
                />
                Recommended
              </label>

              <label>
                <input
                  type="checkbox"
                  name="isBestseller"
                  checked={menu.isBestseller}
                  onChange={handleInput}
                />
                Bestseller
              </label>

              <label>
                <input
                  type="checkbox"
                  name="chefSpecial"
                  checked={menu.chefSpecial}
                  onChange={handleInput}
                />
                Chef Special
              </label>
            </div>

          </div>
        </div>

        {/* VARIANTS */}
        <div className="admin-add-edit-menu-section-card">
          <h4>Variants</h4>
          {menu.variants.map((v, i) => (
            <div key={i} className="admin-menu-variant-row">
              <button
                className="admin-add-edit-menu-add-variant-remove-btn"
                onClick={() => removeVariant(i)}
              >
                <X size={25} />
              </button>
              <div className="variant-input">
                <label>Variant Name</label>
                <input value={v.variantName} onChange={(e) => updateVariant(i, "variantName", e.target.value)} />
              </div>
              <div className="admin-add-edit-menu-variant-input">
                <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  Variant Type
                  {v.variantType && (
                    <span
                      className="variant-info-icon"
                      title={variantTypeInfo[v.variantType]}
                    >
                      ⓘ
                    </span>
                  )}
                </label>

                <select
                  value={v.variantType}
                  onChange={(e) => updateVariant(i, "variantType", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="SIZE">Size</option>
                  <option value="PORTION">Portion</option>
                  <option value="TEMPERATURE">Temperature</option>
                  <option value="QUANTITY">Quantity</option>
                  <option value="PACKAGING">Packaging</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <div className="admin-add-edit-menu-variant-input">
                <label>Quantity / Unit</label>
                <input
                  type="text"
                  placeholder="e.g. 500 grams, 250 ml, 5 liters"
                  value={v.quantityUnit}
                  onChange={(e) => updateVariant(i, "quantityUnit", e.target.value)}
                />

              </div>
              <div className="admin-add-edit-menu-variant-input">
                <label>Price</label>
                <input
                  type="text"
                  placeholder="Price in Rs"
                  value={v.price === 0 ? "" : v.price}
                  onChange={(e) => updateVariant(i, "price", e.target.value)}
                />
              </div>

              <div className="admin-add-edit-menu-variant-input">
                <label>Discount</label>
                <input
                  type="text"
                  placeholder="Discount %"
                  value={v.discountPercentage === 0 ? "" : v.discountPercentage}
                  onChange={(e) => updateVariant(i, "discountPercentage", e.target.value)}
                />
              </div>

              <div className="admin-add-edit-menu-variant-input">
                <label>Order</label>
                <input
                  type="text"
                  placeholder="Display order"
                  value={v.displayOrder === 0 ? "" : v.displayOrder}
                  onChange={(e) => updateVariant(i, "displayOrder", e.target.value)}
                />
              </div>
              <div className="admin-add-edit-menu-variant-input-checkbox">
                <label>is Default</label>
                <input
                  type="checkbox"
                  checked={v.isDefault}
                  onChange={(e) => updateVariant(i, "isDefault", e.target.checked)}
                />
              </div>
              <div className="admin-add-edit-menu-variant-input-checkbox">
                <label>is Available</label>
                <input
                  type="checkbox"
                  checked={v.isAvailable}
                  onChange={(e) => updateVariant(i, "isAvailable", e.target.checked)}
                />
              </div>




            </div>
          ))}

          <button className="admin-add-edit-menu-add-variant-btn" onClick={addVariant}>
            + Add Variant
          </button>
        </div>

        {/* ADDONS */}
        <div className="admin-add-edit-menu-section-card">
          <h3>Addons</h3>

          {/* Addon Dropdown */}
          <select
            value=""
            onChange={(e) => {
              const obj = dropdowns.addons.find(
                (a) => String(a.id ?? a.addOnId ?? a.addonId) === e.target.value
              );
              if (obj) addAddon(obj);
            }}
          >
            <option value="">Select Addon</option>

            {dropdowns.addons.map((a) => (
              <option
                key={a.id ?? a.addOnId ?? a.addonId}
                value={a.id ?? a.addOnId ?? a.addonId}
              >
                {a.addonName}
              </option>
            ))}
          </select>

          {/* Selected Addons List */}
          <div className="admin-addon-box">
            {menu.addons.map((a) => (
              <div
                key={a.addonId}
                className="admin-addon-tag"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  marginBottom: "8px",
                }}
              >
                {/* Addon Name */}
                <strong>{a.addonName}</strong>

                {/* Default Checkbox */}
                <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <input
                    type="checkbox"
                    checked={a.isDefault}
                    onChange={(e) => updateAddon(a.addonId, "isDefault", e.target.checked)}
                  />
                  Default
                </label>

                {/* Max Quantity Input */}
                <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  Max Qty:
                  <input
                    type="number"
                    min="0"
                    style={{ width: "55px" }}
                    value={a.maxQuantity ?? "" }
                    onChange={(e) =>
                      updateAddon(a.addonId, "maxQuantity", Number(e.target.value))
                    }
                  />
                </label>

                {/* Remove Button */}
                <button
                  onClick={() => removeAddon(a)}
                  style={{
                    marginLeft: "auto",
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                    color: "red",
                    fontSize: "18px",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>



        {/* GROUPS */}
        <div className="admin-add-edit-menu-section-card">
          <h3>Customization Groups</h3>
          <select value="" onChange={(e) => addGroup(e.target.value)}>
            <option value="">Select</option>
            {dropdowns.groups.map((g) => (
              <option key={g.id} value={g.groupName}>
                {g.groupName}
              </option>
            ))}
          </select>

          <div className="admin-customize-box">
            {menu.customizationGroupNames.map((g) => (
              <span key={g} className="admin-customize-tag">
                {g}
                <button onClick={() => removeGroup(g)}>✕</button>
              </span>
            ))}
          </div>
        </div>

        <button className="admin-add-edit-menu-save-btn" onClick={handleSubmit}>
          {isEdit ? "Update Menu" : "Add Menu"}
        </button>
      </div>
    </div>
  );
}
