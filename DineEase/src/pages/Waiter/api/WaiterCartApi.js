const API_BASE = "http://localhost:8082/dine-ease/api/v1";

// ---------------------------------------------
// COMMON HEADERS
// ---------------------------------------------
export const authHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
});

// ---------------------------------------------
// GET CART
// GET /v1/cart/get
// ---------------------------------------------
export const getCart = async (
  organizationId,
  sessionId,
  tableNumber,
  token
) => {
  if (!organizationId) throw new Error("organizationId missing");
  if (!sessionId) throw new Error("sessionId missing");

  const params = new URLSearchParams({
    organizationId,
    sessionId,
  });

  if (tableNumber) {
    params.append("tableNumber", tableNumber);
  }

  const url = `${API_BASE}/cart/get?${params.toString()}`;
  console.log("➡️ GET CART URL:", url);

  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
};

// ---------------------------------------------
// ADD ITEM FROM MENU (FULL OBJECTS)
// POST /v1/cart/add-items/{organizationId}
// ---------------------------------------------
export const addItemToCartFromMenu = async (
  organizationId,
  {
    menuItemVariantId,
    quantity = 1,
    addons = [],
    customizations = [],
    sessionId,
    tableNumber,
  },
  token
) => {
  if (!organizationId) throw new Error("organizationId missing");
  if (!menuItemVariantId) throw new Error("variantId missing");
  if (!sessionId) throw new Error("sessionId missing");
  if (!tableNumber) throw new Error("tableNumber missing");

 const body = {
  menuItemVariantId,
  quantity,

  // ✅ BACKEND-SUPPORTED FORMAT
  addonIds: addons.map(a => a.addonId ?? a),
  customizationOptionIds: customizations.map(
    c => c.customizationOptionId ?? c
  ),

  sessionId,
  tableNumber,
};


  console.log("📦 MENU ADD BODY:", body);

  const res = await fetch(
    `${API_BASE}/cart/add-items/${organizationId}`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return true;
};

// ---------------------------------------------
// ADD ITEM FROM CART (+ button)
// IDs ONLY
// ---------------------------------------------
export const addItemToCart = async (
  organizationId,
  body,
  token
) => {
  // 🚫 HARD GUARD (IMPORTANT)
  if (body.addons || body.customizations) {
    throw new Error(
      "Cart payload invalid: use addonIds/customizationOptionIds only"
    );
  }

  const res = await fetch(
    `${API_BASE}/cart/add-items/${organizationId}`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return true;
};

// ---------------------------------------------
// REMOVE ITEM
// DELETE /v1/cart/{organizationId}/items/{cartItemId}/{sessionId}
// ---------------------------------------------
export const removeCartItem = async (
  organizationId,
  cartItemId,
  sessionId,
  token
) => {
  const res = await fetch(
    `${API_BASE}/cart/${organizationId}/items/${cartItemId}/${sessionId}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return true;
};

// ---------------------------------------------
// CLEAR CART
// DELETE /v1/cart/{organizationId}/{sessionId}
// ---------------------------------------------
export const clearCartAPI = async (
  organizationId,
  sessionId,
  token
) => {
  const res = await fetch(
    `${API_BASE}/cart/${organizationId}/${sessionId}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return true;
};
