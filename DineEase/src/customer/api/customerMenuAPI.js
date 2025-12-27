// All menu items for an organization
const BASE_URL = "http://localhost:8082/dine-ease/api/v1/menu";

export const fetchMenuItems = async (filters = {}) => {
  const params = new URLSearchParams();

  // Add only non-empty filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.append(key, value);
    }
  });

  const response = await fetch(`${BASE_URL}/getAll?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch menu items");
  }

  return await response.json();
};

// Fetch dropdown → Item Types (VEG, NON VEG)
export const fetchItemTypes = async (organizationId) => {
  const response = await fetch(
    `${BASE_URL}/item-types?organizationId=${organizationId}&active=true`
  );

  if (!response.ok) throw new Error("Failed to fetch item types");
  return await response.json();
};

// Fetch dropdown → Food Types (WET, DRY, HOT, COOL)
export const fetchFoodTypes = async (organizationId) => {
  const response = await fetch(
    `${BASE_URL}/food-types?organizationId=${organizationId}&active=true`
  );

  if (!response.ok) throw new Error("Failed to fetch food types");
  return await response.json();
};

// Fetch dropdown → Cuisine Types (INDIAN, CHINESE, ITALIAN)
export const fetchCuisineTypes = async (organizationId) => {
  const response = await fetch(
    `${BASE_URL}/cuisine-types?organizationId=${organizationId}&active=true`
  );

  if (!response.ok) throw new Error("Failed to fetch cuisine types");
  return await response.json();
};



// Individual menu item details by ID
export const fetchMenuItemById = async (itemId) => {
  try {
    const res = await fetch(`http://localhost:8082/dine-ease/api/v1/menu/${itemId}`);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching menu item details:", error);
    throw error;
  }
};


// search menu items by keyword within an organization
export const searchMenuItems = async (organizationId, keyword) => {
  const url = `http://localhost:8082/dine-ease/api/v1/menu/organization/${organizationId}/search?keyword=${encodeURIComponent(keyword)}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("Search request failed");
  return await response.json();
};
