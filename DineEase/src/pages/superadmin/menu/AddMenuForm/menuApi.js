// ------------------------------------------------------
// BASE + AUTH
// ------------------------------------------------------
const BASE_URL = "http://localhost:8082/dine-ease/api/v1";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ------------------------------------------------------
// MENU TYPES
// ------------------------------------------------------
export async function fetchTypes() {
  const res = await fetch(`${BASE_URL}/menu/types`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch types");
  return res.json();
}

// ------------------------------------------------------
// MENU DETAILS
// ------------------------------------------------------
export async function fetchMenuById(id) {
  if (!id) throw new Error("Missing id");

  const res = await fetch(`${BASE_URL}/menu/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Failed to fetch menu details");
    throw new Error(text || "Failed to fetch menu details");
  }

  return res.json();
}

// ------------------------------------------------------
// UPDATE MENU (Multipart PUT)
// ------------------------------------------------------
export async function updateMenu(id, formData) {
  if (!id) throw new Error("Missing id");

  const res = await fetch(`${BASE_URL}/menu/${id}`, {
    method: "PUT",
    headers: authHeaders(), // multipart form, no content-type
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Update failed");
    throw new Error(text || "Failed to update menu");
  }

  return res.json();
}

// ------------------------------------------------------
// DELETE MENU
// ------------------------------------------------------
export async function deleteMenu(id) {
  if (!id) throw new Error("Missing id");

  const res = await fetch(`${BASE_URL}/menu/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Delete failed");
    throw new Error(text || "Failed to delete menu");
  }

  return res.json();
}

// ------------------------------------------------------
// INDIVIDUAL DROPDOWN APIs (require organizationId)
// ------------------------------------------------------
export async function fetchCategories(organizationId) {
  const res = await fetch(`${BASE_URL}/menu-category/parent-categories?organizationId=${organizationId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchItemTypes(organizationId) {
  const res = await fetch(
    `${BASE_URL}/menu/item-types?organizationId=${organizationId}&active=true`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error("Failed to fetch item types");
  return res.json();
}

export async function fetchFoodTypes(organizationId) {
  const res = await fetch(
    `${BASE_URL}/menu/food-types?organizationId=${organizationId}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error("Failed to fetch food types");
  return res.json();
}

export async function fetchCuisineTypes(organizationId) {
  const res = await fetch(
    `${BASE_URL}/menu/cuisine-types?organizationId=${organizationId}&active=true`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error("Failed to fetch cuisine types");
  return res.json();
}

export async function fetchAddons(organizationId) {
  const res = await fetch(`${BASE_URL}/menu/addons/${organizationId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch addons");
  return res.json();
}

export async function fetchCustomizationGroups(organizationId) {
  const res = await fetch(
    `${BASE_URL}/menu/customization-group/organization/${organizationId}/active`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error("Failed to fetch customization groups");
  return res.json();
}

// ------------------------------------------------------
// SINGLE FUNCTION: fetchDropdowns
// ------------------------------------------------------
export async function fetchDropdowns(organizationId) {
  if (!organizationId) throw new Error("Missing organizationId");

  const headers = authHeaders();

  const [
    categoryRes,
    itemTypesRes,
    foodTypesRes,
    cuisinesRes,
    addonsRes,
    groupsRes,
  ] = await Promise.all([
    fetch(`${BASE_URL}/menu-category/parent-categories?organizationId=${organizationId}`, { headers }),
    fetch(`${BASE_URL}/menu/item-types?organizationId=${organizationId}&active=true`, { headers }),
    fetch(`${BASE_URL}/menu/food-types?organizationId=${organizationId}`, { headers }),
    fetch(`${BASE_URL}/menu/cuisine-types?organizationId=${organizationId}&active=true`, { headers }),
    fetch(`${BASE_URL}/menu/addons/${organizationId}`, { headers }),
    fetch(`${BASE_URL}/menu/customization-group/organization/${organizationId}/active`, { headers }),
  ]);

  return {
    categories: await categoryRes.json(),
    itemTypes: await itemTypesRes.json(),
    foodTypes: await foodTypesRes.json(),
    cuisines: await cuisinesRes.json(),
    addons: await addonsRes.json(),
    groups: await groupsRes.json(),
  };
}
