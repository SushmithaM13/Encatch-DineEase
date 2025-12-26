// src/customer/api/customerCartAPI.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8082/dine-ease/api/v1";

/* ===================== ADD ITEM TO CART ===================== */
export const addItemToCart = async ({
  orgId,                 // ✅ MUST be UUID
  menuItemVariantId,
  quantity,
  addons = [],
  customizations = [],
  sessionId,             // ✅ REQUIRED in body
  tableNumber,
  specialInstructions = "",
}) => {

  // 🔒 Basic validation
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
    sessionId,           // ✅ FIXED (was missing)
    tableNumber,         // ✅ "T-3"
  };

  console.log("🟢 FINAL ADD TO CART PAYLOAD:", payload);
  console.log("🟢 ORG ID (UUID):", orgId);

  const response = await axios.post(
    `${API_BASE_URL}/cart/add-items/${orgId}`, // ✅ FIXED
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
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
