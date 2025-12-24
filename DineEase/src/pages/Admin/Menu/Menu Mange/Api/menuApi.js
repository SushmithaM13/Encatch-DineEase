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

  if (!res.ok) throw new Error(await res.text());

  return res.json();
}

// ------------------------------------------------------
// UPDATE MENU (with FormData for images)
// ------------------------------------------------------
export async function updateMenu(menu) {
  const formData = new FormData();

  // IDs (only append if truthy)
  if (menu.menuItemId) formData.append("menuItemId", menu.menuItemId);
  if (menu.categoryId) formData.append("categoryId", menu.categoryId);
  if (menu.itemTypeId) formData.append("itemTypeId", menu.itemTypeId);
  if (menu.foodTypeId) formData.append("foodTypeId", menu.foodTypeId);
  if (menu.cuisineTypeId) formData.append("cuisineTypeId", menu.cuisineTypeId);

  formData.append("organizationId", menu.organizationId);

  // Basic
  formData.append("itemName", menu.itemName || "");
  formData.append("description", menu.description || "");
  formData.append("spiceLevel", menu.spiceLevel ?? 1);
  formData.append("preparationTime", menu.preparationTime ?? 1);
  formData.append("allergenInfo", menu.allergenInfo || "");

  // Flags
  formData.append("isAvailable", menu.isAvailable ? "true" : "false");
  formData.append("isRecommended", menu.isRecommended ? "true" : "false");
  formData.append("isBestseller", menu.isBestseller ? "true" : "false");
  formData.append("chefSpecial", menu.chefSpecial ? "true" : "false");

  // Names
  formData.append("categoryName", menu.categoryName || "");
  formData.append("itemTypeName", menu.itemTypeName || "");
  formData.append("foodTypeName", menu.foodTypeName || "");
  formData.append("cuisineTypeName", menu.cuisineTypeName || "");

  // Variants
  (menu.variants || []).forEach((v, i) => {
    if (v.variantId) formData.append(`variants[${i}].variantId`, v.variantId);
    formData.append(`variants[${i}].variantName`, v.variantName || "");
    formData.append(`variants[${i}].variantType`, v.variantType || "");
    formData.append(`variants[${i}].quantityUnit`, v.quantityUnit || "");
    formData.append(`variants[${i}].displayOrder`, v.displayOrder ?? 0);
    formData.append(`variants[${i}].price`, v.price ?? 0);
    formData.append(`variants[${i}].discountPrice`, v.discountPrice ?? 0);
    formData.append(`variants[${i}].isDefault`, v.isDefault ? "true" : "false");
    formData.append(`variants[${i}].isAvailable`, v.isAvailable ? "true" : "false");
  });

  // Addons
  (menu.addons || []).forEach((a, i) => {
    formData.append(`addons[${i}].addonName`, a.addonName || "");
    formData.append(`addons[${i}].isDefault`, a.isDefault ? "true" : "false");
    formData.append(`addons[${i}].maxQuantity`, a.maxQuantity ?? 1);
  });

  // Groups
  (menu.customizationGroupNames || []).forEach((g, i) => {
    formData.append(`customizationGroupNames[${i}]`, g);
  });

  // Image
  if (menu.imageFile?.file) {
    formData.append("image", menu.imageFile.file);
  } else if (menu.imageData) {
    const byteCharacters = atob(menu.imageData);
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i));
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: "image/jpeg" });
    formData.append("image", blob);
  }

  const res = await fetch(`${BASE_URL}/menu/update`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.text();
}




// ------------------------------------------------------
// ADD MENU
// ------------------------------------------------------
export async function addMenu(menu, imageFile) {
  const formData = new FormData();

  // BASIC FIELDS
  formData.append("organizationId", menu.organizationId);
  formData.append("categoryName", menu.categoryName);
  formData.append("itemName", menu.itemName);
  formData.append("description", menu.description);
  formData.append("itemTypeName", menu.itemTypeName);
  formData.append("foodTypeName", menu.foodTypeName);
  formData.append("cuisineTypeName", menu.cuisineTypeName);
  formData.append("spiceLevel", menu.spiceLevel);
  formData.append("preparationTime", menu.preparationTime);
  formData.append("allergenInfo", menu.allergenInfo);
  formData.append("isAvailable", menu.isAvailable);
  formData.append("isRecommended", menu.isRecommended);
  formData.append("isBestseller", menu.isBestseller);
  formData.append("chefSpecial", menu.chefSpecial);

  // VARIANTS
  menu.variants.forEach((v, i) => {
    formData.append(`variants[${i}].variantName`, v.variantName);
    formData.append(`variants[${i}].variantType`, v.variantType);
    formData.append(`variants[${i}].price`, v.price);
    formData.append(`variants[${i}].discountPrice`, v.discountPrice ?? "");
    formData.append(`variants[${i}].isDefault`, v.isDefault);
    formData.append(`variants[${i}].isAvailable`, v.isAvailable);
    formData.append(`variants[${i}].displayOrder`, v.displayOrder);
  });

  // ADDONS
  menu.addons.forEach((a, i) => {
    formData.append(`addons[${i}].addonName`, a.addonName);
    formData.append(`addons[${i}].isDefault`, a.isDefault);
    formData.append(`addons[${i}].maxQuantity`, a.maxQuantity);
  });

  // CUSTOMIZATION GROUPS
  menu.customizationGroupNames.forEach((g, i) => {
    formData.append(`customizationGroupNames[${i}]`, g);
  });

  // 🔥 IMAGE
  if (imageFile?.file) {
    formData.append("image", imageFile.file); // MUST be File object
  }

  // AUTH HEADER ONLY (DO NOT SET Content-Type)
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("staffToken");

  const response = await fetch(`${BASE_URL}/menu/add`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // ❌ DO NOT set Content-Type for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to add menu");
  }

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return await response.json();   // only parse if JSON exists
  }


  return null;
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
  const res = await fetch(
    `${BASE_URL}/menu/getAll?organizationId=${orgId}`,
    { headers: authHeaders() }
  );

  if (!res.ok) throw new Error("Failed to fetch menus");

  const data = await res.json();

  return (Array.isArray(data) ? data : []).map(m => ({
    ...m,

    // ✅ ALWAYS expose imageData for UI
    imageData: m.imageData ?? null,

    // optional: usable imagePreview also
    imagePreview: m.imageData
      ? `data:image/jpeg;base64,${m.imageData}`
      : m.imageUrl
        ? `http://localhost:8082/uploads/menu-image/${m.imageUrl.split(/[/\\]/).pop()}`
        : null,
  }));
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
// NORMALIZE MENU BY ID
// ------------------------------------------------------
export function normalizeMenuResponse(data) {
  if (!data) return {};

  return {
    menuItemId: data.id,
    organizationId: data.organizationId,

    category: { id: data.categoryId, categoryName: data.categoryName ?? "" },
    itemType: { id: data.itemTypeId, itemTypeName: data.itemTypeName ?? "" },
    foodType: { id: data.foodTypeId, foodTypeName: data.foodTypeName ?? "" },
    cuisine: { id: data.cuisineTypeId, cuisineTypeName: data.cuisineTypeName ?? "" },

    itemName: data.itemName ?? "",
    description: data.description ?? "",
    spiceLevel: data.spiceLevel ?? 1,
    preparationTime: data.preparationTime ?? 1,
    allergenInfo: data.allergenInfo ?? "",

    isAvailable: data.isAvailable ?? true,
    isRecommended: data.isRecommended ?? false,
    isBestseller: data.isBestseller ?? false,
    chefSpecial: data.chefSpecial ?? false,

    variants: (data.variants || []).map(v => ({
      variantId: v.variantId ?? v.id,
      variantName: v.variantName,
      variantType: v.variantType,
      quantityUnit: v.quantityUnit,
      displayOrder: v.displayOrder,
      price: v.price,
      discountPrice: v.discountPrice,
      isDefault: v.isDefault ?? false,
      isAvailable: v.isAvailable ?? true,
    })),

    addons: (data.addons || []).map(a => ({
      addonId: a.addonId ?? a.id,
      addonName: a.addonName ?? a.name,
      isDefault: a.isDefault ?? false,
      maxQuantity: a.maxQuantity ?? 1,
    })),

    customizationGroupNames:
      (data.customizationGroups || []).map(g => g.groupName ?? g.name),

    // 🔥🔥 THIS IS THE FIX 🔥🔥
    imageData: data.imageData ?? null,

    imagePreview: data.imageData
      ? `data:image/jpeg;base64,${data.imageData}`
      : data.imageUrl
        ? `http://localhost:8082/uploads/menu-image/${data.imageUrl.split(/[/\\]/).pop()}`
        : null,
  };
}


// ------------------------------------------------------
// NORMALIZER for list responses
// ------------------------------------------------------
function normalizeList(obj) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  const key = Object.keys(obj).find(k => Array.isArray(obj[k]));
  return key ? obj[key] : [];
}

// ------------------------------------------------------
// DROPDOWNS
// ------------------------------------------------------
export async function getCategoryList() {
  const res = await fetch(`${BASE_URL}/menu-category/parent-categories`, {
    headers: authHeaders(),
  });
  return normalizeList(await res.json());
}

export async function getItemTypes(orgId) {
  const res = await fetch(
    `${BASE_URL}/menu/item-types?organizationId=${orgId}&active=true`,
    { headers: authHeaders() }
  );
  return normalizeList(await res.json());
}

export async function getFoodTypes(orgId) {
  const res = await fetch(
    `${BASE_URL}/menu/food-types?organizationId=${orgId}`,
    { headers: authHeaders() }
  );
  return normalizeList(await res.json());
}

export async function getCuisineTypes(orgId) {
  const res = await fetch(
    `${BASE_URL}/menu/cuisine-types?organizationId=${orgId}&active=true`,
    { headers: authHeaders() }
  );
  return normalizeList(await res.json());
}

export async function getAddons(orgId) {
  const res = await fetch(`${BASE_URL}/menu/addons/${orgId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch addons");

  return normalizeList(await res.json());
}

export async function getCustomizationGroups(orgId) {
  const res = await fetch(
    `${BASE_URL}/menu/customization-group/organization/${orgId}/active`,
    { headers: authHeaders() }
  );

  if (!res.ok) throw new Error("Failed to fetch customization groups");

  return normalizeList(await res.json());
}

// ------------------------------------------------------
// COMBINED DROPDOWNS
// ------------------------------------------------------
export async function getMenuDropdowns(orgId) {
  const [categories, itemTypes, foodTypes, cuisines, addons, groups] =
    await Promise.all([
      getCategoryList(),
      getItemTypes(orgId),
      getFoodTypes(orgId),
      getCuisineTypes(orgId),
      getAddons(orgId),
      getCustomizationGroups(orgId),
    ]);

  return {
    categories: categories.map(c => ({ id: c.id, categoryName: c.categoryName })),
    itemTypes: itemTypes.map(t => ({ id: t.id, itemTypeName: t.name })),
    foodTypes: foodTypes.map(f => ({ id: f.id, foodTypeName: f.name })),
    cuisines: cuisines.map(c => ({ id: c.id, cuisineTypeName: c.name })),
    addons: addons.map(a => ({
      id: a.addOnId || a.id,
      addonName: a.addOnName || a.name,
      isDefault: a.isDefault ?? false,
      maxQuantity: a.maxQuantity ?? 1,
    })),
    groups: groups.map(g => ({
      id: g.customizationGroupId || g.id,
      groupName: g.groupName || g.name,
    })),
  };
}
