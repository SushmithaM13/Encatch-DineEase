// src/pages/Waiter/api/WaiterMenuApi.js

const BASE = "http://localhost:8082/dine-ease/api/v1/menu";

function getToken() {
  return localStorage.getItem("token");
}

// Generic GET request with token
async function getRequest(url, params = {}) {
  const query = new URLSearchParams(params).toString();
  const finalUrl = query ? `${url}?${query}` : url;

  const token = getToken();

  const response = await fetch(finalUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // ✅ TOKEN ADDED
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API ERROR:", finalUrl, errorText);
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// STAFF PROFILE API
export function getStaffProfile() {
  return getRequest("http://localhost:8082/dine-ease/api/v1/staff/profile");
}

// MENU TYPES API
export function getMenuTypes(organizationId) {
  return getRequest(
    "http://localhost:8082/dine-ease/api/v1/menu/item-types",
    { organizationId }
  );
}

// ✔ Get all menu items
export function getAllMenuItems(organizationId) {
  return getRequest(`${BASE}/getAll`, { organizationId });
}

// ✔ Get menu items by category
export function getMenuByCategory(categoryName) {
  return getRequest(`${BASE}/category/${categoryName}`);
}
// MENU CATEGORIES API
export function getMenuCategories() {
  return getRequest(
    "http://localhost:8082/dine-ease/api/v1/menu/categories",
    {  }
  );
}

// ✔ Get menu items by type
export function getMenuByType(organizationId, typeName) {
  return getRequest(`${BASE}/organization/${organizationId}/type/${typeName}`);
}

// ✔ Search menu items
export function searchMenuItems(organizationId, keyword) {
  return getRequest(`${BASE}/organization/${organizationId}/search`, { keyword });
}
