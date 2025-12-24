import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { fetchProfile, getMenuById, getMenuDropdowns, addMenu, updateMenu } from "./Api/menuApi";

import { Minus } from "lucide-react";
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
    if (
      !isEdit ||
      !orgId ||
      !dropdowns.categories.length ||
      !dropdowns.itemTypes.length ||
      !dropdowns.foodTypes.length ||
      !dropdowns.cuisines.length
    )
      return;

    async function loadEditData() {
      try {
        const data = await getMenuById(menuId);
        if (!data) return;

        // image preview
        setImagePreview(
          data.imageData
            ? `data:image/jpeg;base64,${data.imageData}`
            : data.imageUrl ?? null
        );

        /* -----------------------------
           🔥 RESOLVE DROPDOWN IDS
        ------------------------------ */

        const resolvedCategory =
          dropdowns.categories.find(
            c =>
              c.id === data.category?.id ||
              c.categoryName === data.categoryName
          ) || {};

        const resolvedItemType =
          dropdowns.itemTypes.find(
            t =>
              t.id === data.itemType?.id ||
              t.itemTypeName === data.itemTypeName
          ) || {};

        const resolvedFoodType =
          dropdowns.foodTypes.find(
            f =>
              f.id === data.foodType?.id ||
              f.foodTypeName === data.foodTypeName
          ) || {};

        const resolvedCuisine =
          dropdowns.cuisines.find(
            c =>
              c.id === data.cuisine?.id ||
              c.cuisineTypeName === data.cuisineTypeName
          ) || {};

        /* -----------------------------
           ✅ SET MENU STATE
        ------------------------------ */

        setMenu(prev => ({
          ...prev,
          menuItemId: data.menuItemId,
          organizationId: data.organizationId || orgId,

          // CATEGORY
          category: {
            id: resolvedCategory.id || "",
            categoryName:
              resolvedCategory.categoryName || data.categoryName || "",
          },
          categoryName:
            resolvedCategory.categoryName || data.categoryName || "",

          // ITEM TYPE
          itemType: {
            id: resolvedItemType.id || "",
            itemTypeName:
              resolvedItemType.itemTypeName || data.itemTypeName || "",
          },
          itemTypeName:
            resolvedItemType.itemTypeName || data.itemTypeName || "",

          // FOOD TYPE
          foodType: {
            id: resolvedFoodType.id || data.foodTypeId || "", // fallback to backend ID
            foodTypeName: resolvedFoodType.foodTypeName || data.foodTypeName || "",
          },
          foodTypeName: resolvedFoodType.foodTypeName || data.foodTypeName || "",


          // CUISINE
          cuisine: {
            id: resolvedCuisine.id || "",
            cuisineTypeName:
              resolvedCuisine.cuisineTypeName || data.cuisineTypeName || "",
          },
          cuisineTypeName:
            resolvedCuisine.cuisineTypeName || data.cuisineTypeName || "",

          // BASIC FIELDS
          itemName: data.itemName ?? "",
          description: data.description ?? "",
          spiceLevel: data.spiceLevel ?? 1,
          preparationTime: data.preparationTime ?? 1,
          allergenInfo: data.allergenInfo ?? "",

          isAvailable: data.isAvailable ?? true,
          isRecommended: data.isRecommended ?? false,
          isBestseller: data.isBestseller ?? false,
          chefSpecial: data.chefSpecial ?? false,

          // VARIANTS
          variants: (data.variants || []).map(v => ({
            variantId: v.variantId ?? v.id ?? "",
            variantName: v.variantName ?? "",
            variantType: v.variantType ?? "",
            quantityUnit: v.quantityUnit ?? "",
            displayOrder: v.displayOrder ?? 0,
            price: v.price ?? 0,
            discountPrice: v.discountPrice ?? 0,
            isDefault: v.isDefault ?? false,
            isAvailable: v.isAvailable ?? true,
          })),

          // ADDONS
          addons: (data.addons || []).map(a => ({
            addonId: a.addonId ?? a.id ?? a.addOnId ?? "",
            addonName: a.addonName ?? a.name ?? a.addOnName ?? "",
            isDefault: a.isDefault ?? false,
            maxQuantity: a.maxQuantity ?? 1,
          })),

          // CUSTOMIZATION GROUPS
          customizationGroupNames:
            (data.customizationGroups ||
              data.customizationGroupNames ||
              []).map(g => g.groupName ?? g.name ?? g),
        }));
      } catch (err) {
        console.error("Error loading menu:", err);
        alert("Failed to load menu");
      }
    }

    loadEditData();
  }, [
    isEdit,
    menuId,
    orgId,
    dropdowns.categories,
    dropdowns.itemTypes,
    dropdowns.foodTypes,
    dropdowns.cuisines,
  ]);



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
    setMenu((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== i),
    }));
  };

  // ---------------- ADDONS ----------------
  const addAddon = (addon) => {
    if (!menu.addons.some((a) => a.addonId === addon.addonId)) {
      setMenu((prev) => ({
        ...prev,
        addons: [
          ...prev.addons,
          {
            addonId: addon.addonId ?? addon.id,
            addonName: addon.addonName ?? addon.name,
            isDefault: addon.isDefault ?? false,
            maxQuantity: addon.maxQuantity ?? 1,
          },
        ],
      }));
    }
  };

  const removeAddon = (addon) => {
    setMenu((prev) => ({
      ...prev,
      addons: prev.addons.filter((a) => a.addonId !== addon.addonId),
    }));
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
  const handleSubmit = async () => {
    try {
      if (isEdit) {
        // 🔥 VALIDATION (OPTIONAL BUT SAFE)
        // if (!menu.foodType.id) {
        //   alert("Food Type is required");
        //   return;
        // }

        const payload = {
          ...menu,
          organizationId: menu.organizationId || orgId,

          // ✅ SEND IDS (THIS FIXES YOUR ERROR)
          categoryId: menu.category.id,
          itemTypeId: menu.itemType.id,
          foodTypeId: menu.foodType.id,
          cuisineTypeId: menu.cuisine.id,

          categoryName: menu.category.categoryName,
          itemTypeName: menu.itemType.itemTypeName,
          foodTypeName: menu.foodType.foodTypeName,
          cuisineTypeName: menu.cuisine.cuisineTypeName,

          imageData: imageFile?._base64 || null,
        };

        await updateMenu(payload);
        alert("Menu updated!");
      } else {
        await addMenu(
          { ...menu, organizationId: menu.organizationId || orgId },
          imageFile
        );
        alert("Menu added!");
      }

      navigate("/AdminDashboard/menu");
    } catch (err) {
      console.error(err);
      alert("Failed to save menu");
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
                type="number"
                name="spiceLevel"
                min="1"
                max="5"
                value={menu.spiceLevel}
                onChange={handleInput}
              />
            </div>

            {/* Preparation Time */}
            <div>
              <label>Preparation Time (mins)</label>
              <input
                type="number"
                name="preparationTime"
                min="1"
                value={menu.preparationTime}
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
                <input
                  type="number"
                  value={v.discountPrice}
                  onChange={(e) => updateVariant(i, "discountPrice", Number(e.target.value))}
                />
              </div>

              <div className="variant-input">
                <label>Order</label>
                <input
                  type="number"
                  value={v.displayOrder}
                  onChange={(e) => updateVariant(i, "displayOrder", Number(e.target.value))}
                />
              </div>

              <button onClick={() => removeVariant(i)}>
                <Minus size={14} />
              </button>
            </div>
          ))}

          <button className="admin-add-edit-menu-add-variant-btn" onClick={addVariant}>
            + Add Variant
          </button>
        </div>

        {/* ADDONS */}
        <div className="admin-add-edit-menu-section-card">
          <h3>Addons</h3>
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
              <option key={a.id ?? a.addOnId ?? a.addonId} value={a.id ?? a.addOnId ?? a.addonId}>
                {a.addonName}
              </option>
            ))}
          </select>

          <div className="admin-addon-box">
            {menu.addons.map((a) => (
              <span key={a.addonId} className="admin-addon-tag">
                {a.addonName}
                <button onClick={() => removeAddon(a)}>✕</button>
              </span>
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
