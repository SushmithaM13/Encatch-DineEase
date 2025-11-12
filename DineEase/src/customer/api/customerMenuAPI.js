// All menu items for an organization
import axios from "axios";

export const fetchMenuItems = async (organizationId) => {
  if (!organizationId) return [];
  
  const url = `http://localhost:8082/dine-ease/api/v1/menu/organization/${organizationId}?page=0&size=10`; // ✅ FIXED URL
  
  const response = await axios.get(url);
  return response.data.content; // Adjust if backend uses .data.data or .content etc.
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
