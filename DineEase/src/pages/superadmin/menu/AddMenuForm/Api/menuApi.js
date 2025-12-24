// ------------------------------------------------------
// MENU API (ALL MENU OPERATIONS IN ONE FILE)
// ------------------------------------------------------

const BASE_URL = "http://localhost:8082/dine-ease/api/v1";

// ------------------------------
// AUTH HEADERS
// ------------------------------
function authHeaders() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("staffToken");

  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ------------------------------------------------------
// PROFILE (returns organizationId)
// ------------------------------------------------------
export async function fetchProfile() {
  const res = await fetch(`${BASE_URL}/staff/profile`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch profile");
  }

  return res.json();
}

// ------------------------------------------------------
// FORM DATA BUILDER (ADD + UPDATE)
// ------------------------------------------------------
export function buildMenuFormData(menu, imageFile) {
  const fd = new FormData();

  fd.append("organizationId", menu.organizationId || "");

  if (menu.menuItemId) {
    fd.append("menuItemId", menu.menuItemId || menu.id || "");
  }

  // SAFE ID extraction (handles object or raw ID)
  const safeId = (obj, rawId) => {
    if (!obj) return rawId || "";
    return obj.id || rawId || "";
  };

  fd.append("categoryId", safeId(menu.category, menu.categoryId));
  fd.append("itemTypeId", safeId(menu.itemType, menu.itemTypeId));
  fd.append("foodTypeId", safeId(menu.foodType, menu.foodTypeId));
  fd.append("cuisineTypeId", safeId(menu.cuisine, menu.cuisineTypeId));

  fd.append("categoryName", menu.categoryName || "");
  fd.append("itemTypeName", menu.itemTypeName || "");
  fd.append("foodTypeName", menu.foodTypeName || "");
  fd.append("cuisineTypeName", menu.cuisineTypeName || "");

  fd.append("itemName", menu.itemName || "");
  fd.append("description", menu.description || "");
  fd.append("spiceLevel", menu.spiceLevel ?? 1);
  fd.append("preparationTime", menu.preparationTime ?? 1);
  fd.append("allergenInfo", menu.allergenInfo || "");

  fd.append("isAvailable", menu.isAvailable ? "true" : "false");
  fd.append("isRecommended", menu.isRecommended ? "true" : "false");
  fd.append("isBestseller", menu.isBestseller ? "true" : "false");
  fd.append("chefSpecial", menu.chefSpecial ? "true" : "false");

  // VARIANTS
  (menu.variants || []).forEach((v, i) => {
    fd.append(`variants[${i}].variantId`, v.variantId || "");
    fd.append(`variants[${i}].variantName`, v.variantName || "");
    fd.append(`variants[${i}].variantType`, v.variantType || "");
    fd.append(`variants[${i}].quantityUnit`, v.quantityUnit || "");
    fd.append(`variants[${i}].displayOrder`, v.displayOrder ?? 0);
    fd.append(`variants[${i}].price`, v.price ?? 0);
    fd.append(`variants[${i}].discountPrice`, v.discountPrice ?? 0);
    fd.append(`variants[${i}].isDefault`, v.isDefault ? "true" : "false");
    fd.append(`variants[${i}].isAvailable`, v.isAvailable ? "true" : "false");
  });

  // ADDONS
  (menu.addons || []).forEach((a, i) => {
    fd.append(`addons[${i}].addonId`, a.addonId || a.id || "");
    fd.append(`addons[${i}].addonName`, a.addonName || "");
    fd.append(`addons[${i}].isDefault`, a.isDefault ? "true" : "false");
    fd.append(`addons[${i}].maxQuantity`, a.maxQuantity ?? 1);
  });

  // CUSTOM GROUPS
  (menu.customizationGroupNames || []).forEach((name, i) => {
    fd.append(`customizationGroupNames[${i}]`, name);
  });

  if (imageFile) {
    fd.append("image", imageFile);
  }

  return fd;
}




// ------------------------------------------------------
// ADD MENU
// ------------------------------------------------------
export async function addMenu(formData) {
  const res = await fetch(`${BASE_URL}/menu/add`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}

// ------------------------------------------------------
// UPDATE MENU
// ------------------------------------------------------
// UPDATE MENU
export async function updateMenu(menu) {
  // Build FormData with menuItemId
  const formData = buildMenuFormData(menu, menu.imageFile);

  const res = await fetch(`${BASE_URL}/menu/update`, {
    method: "PUT",
    headers: { ...authHeaders() }, // DO NOT set Content-Type; browser sets it for FormData
    body: formData,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}


// ------------------------------------------------------
// DELETE MENU
// ------------------------------------------------------
export async function deleteMenu(menuId) {
  const res = await fetch(`${BASE_URL}/menu/delete/${menuId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ------------------------------------------------------
// GET ALL MENUS BY ORG
// ------------------------------------------------------
export async function getAllMenus(orgId) {
  const res = await fetch(`${BASE_URL}/menu/getAll?organizationId=${orgId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch menus");
  return res.json();
}

// ------------------------------------------------------
// GET MENU BY ID
// ------------------------------------------------------
export async function getMenuById(id) {
  const res = await fetch(`${BASE_URL}/menu/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error(await res.text());

  const json = await res.json();
  return normalizeMenuResponse(json);
}

// ------------------------------------------------------
// NORMALIZE MENU BY ID --> Used for EDIT screen
// ------------------------------------------------------
export function normalizeMenuResponse(data) {
  if (!data) return {};

  let imagePreview = null;
  if (data.imageData) {
    imagePreview = `data:image/jpeg;base64,${data.imageData}`;
  } else if (data.imageUrl) {
    imagePreview = data.imageUrl;
  }

  return {
    menuItemId: data.id,
    organizationId: data.organizationId,

    // IDs (VERY IMPORTANT for update)
    categoryId: data.categoryId,
    itemTypeId: data.itemTypeId,
    foodTypeId: data.foodTypeId,
    cuisineTypeId: data.cuisineTypeId,

    // Names
    categoryName: data.categoryName || "",
    itemTypeName: data.itemTypeName || "",
    foodTypeName: data.foodTypeName || "",
    cuisineTypeName: data.cuisineTypeName || "",

    // Basic
    itemName: data.itemName || "",
    description: data.description || "",
    spiceLevel: data.spiceLevel ?? 1,
    preparationTime: data.preparationTime ?? 1,
    allergenInfo: data.allergenInfo || "",

    // Flags
    isAvailable: data.isAvailable ?? true,
    isRecommended: data.isRecommended ?? false,
    isBestseller: data.isBestseller ?? false,
    chefSpecial: data.chefSpecial ?? false,

    // Variants
    variants: (data.variants || []).map(v => ({
      variantId: v.variantId || v.id,
      variantName: v.variantName,
      variantType: v.variantType,
      quantityUnit: v.quantityUnit,
      displayOrder: v.displayOrder,
      price: v.price,
      discountPrice: v.discountPrice,
      isDefault: v.isDefault ?? false,
      isAvailable: v.isAvailable ?? true,
    })),

    // Addons
    addons: (data.addons || []).map(a => ({
      addonId: a.addonId || a.id,
      addonName: a.addonName || a.name,
      isDefault: a.isDefault ?? false,
      maxQuantity: a.maxQuantity ?? 1
    })),

    // Custom groups
    customizationGroupNames: (data.customizationGroups || [])
      .map(g => g.groupName || g.name),

    imagePreview
  };
}


// ------------------------------------------------------
// NORMALIZER → fixes ANY backend response shape
// ------------------------------------------------------
function normalizeList(obj) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  const key = Object.keys(obj).find((k) => Array.isArray(obj[k]));
  return key ? obj[key] : [];
}

// ------------------------------------------------------
// DROPDOWN API CALLS
// ------------------------------------------------------
export async function getCategoryList() {
  const res = await fetch(`${BASE_URL}/menu-category/parent-categories`, {
    headers: authHeaders(),
  });
  return normalizeList(await res.json());
}

export async function getItemTypes(orgId) {
  const res = await fetch(`${BASE_URL}/menu/item-types?organizationId=${orgId}&active=true`, {
    headers: authHeaders(),
  });
  return normalizeList(await res.json());
}

export async function getFoodTypes(orgId) {
  const res = await fetch(`${BASE_URL}/menu/food-types?organizationId=${orgId}`, {
    headers: authHeaders(),
  });
  return normalizeList(await res.json());
}

export async function getCuisineTypes(orgId) {
  const res = await fetch(`${BASE_URL}/menu/cuisine-types?organizationId=${orgId}&active=true`, {
    headers: authHeaders(),
  });
  return normalizeList(await res.json());
}

export async function getAddons(orgId) {
  const res = await fetch(`${BASE_URL}/menu/addons/${orgId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch addons");

  const json = await res.json();
  // console.log("Addons fetched:", json);

  return normalizeList(json);
}


export async function getCustomizationGroups(orgId) {
  const res = await fetch(
    `${BASE_URL}/menu/customization-group/organization/${orgId}/active`,
    { headers: authHeaders() }
  );

  if (!res.ok) throw new Error("Failed to fetch customization groups");

  const json = await res.json();
  // console.log("Customization Groups fetched:", json);

  return normalizeList(json);
}

// ------------------------------------------------------
// COMBINED DROPDOWNS (USED IN FRONTEND)
// ------------------------------------------------------
export async function getMenuDropdowns(orgId) {
  const [
    categories,
    itemTypes,
    foodTypes,
    cuisines,
    addons,
    groups
  ] = await Promise.all([
    getCategoryList(),
    getItemTypes(orgId),
    getFoodTypes(orgId),
    getCuisineTypes(orgId),
    getAddons(orgId),
    getCustomizationGroups(orgId),
  ]);

  return {
    categories: categories.map(c => ({
      id: c.id,
      categoryName: c.categoryName
    })),

    itemTypes: itemTypes.map(t => ({
      id: t.id,
      itemTypeName: t.name
    })),

    foodTypes: foodTypes.map(f => ({
      id: f.id,
      foodTypeName: f.name
    })),

    cuisines: cuisines.map(c => ({
      id: c.id,
      cuisineTypeName: c.name
    })),

    addons: addons.map(a => ({
      id: a.addOnId || a.id,
      addonName: a.addOnName || a.name,
      isDefault: a.isDefault || false,
      maxQuantity: a.maxQuantity || 1
    })),

    groups: groups.map(g => ({
      id: g.customizationGroupId || g.id,
      groupName: g.groupName || g.name
    })),
  };
}
