// src/customer/api/customerCartAPI.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8082/dine-ease/api/v1";

/* ===================== ADD ITEM TO CART ===================== */
export const addItemToCart = async ({
  orgId, // still validated if backend uses it internally
  menuItemVariantId,
  quantity,
  addons = [],
  customizations = [],
  sessionId,
  tableNumber,
  specialInstructions = "",
}) => {
  if (!orgId || !menuItemVariantId || !quantity || !sessionId || !tableNumber) {
    throw new Error("Missing required parameters for addItemToCart");
  }

  const payload = {
    menuItemVariantId: Number(menuItemVariantId),
    quantity: Number(quantity),
    addons: addons.map(a => ({
      addonId: Number(a.addonId),
      additionalCharge: Number(a.additionalCharge || 0),
    })),
    customizations: customizations.map(c => ({
      customizationOptionId: Number(c.customizationOptionId),
      customizationOptionName: c.customizationOptionName || "",
      additionalCharge: Number(c.additionalCharge || 0),
    })),
    specialInstructions,
    tableNumber, // ✅ keep
  };

  console.log("🟢 Add to Cart Payload:", payload);

  const response = await axios.post(
    `${API_BASE_URL}/cart/add-items/${sessionId}`, // ✅ FIXED
    payload,
    { headers: { "Content-Type": "application/json" } }
  );

  return response.data;
};

/* ===================== GET CART ===================== */
export const getCart = async ({
  organizationId,
  sessionId,
  tableNumber,
}) => {
  if (!organizationId || !sessionId) {
    throw new Error("Missing organizationId or sessionId for getCart");
  }

  console.log("🟢 Fetching cart:", {
    organizationId,
    sessionId,
    tableNumber,
  });

  const response = await axios.get(
    `${API_BASE_URL}/cart/get`,
    {
      params: {
        organizationId,
        sessionId,
        tableNumber,
      },
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};
