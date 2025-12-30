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
  console.log(" GET CART URL:", url);

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
    specialInstructions = "",
    sessionId,
    tableNumber
  },
  token
) => {

  if (!organizationId) throw new Error("organizationId missing");
  if (!menuItemVariantId) throw new Error("menuItemVariantId missing");
  if (!sessionId) throw new Error("sessionId missing");
  if (!tableNumber) throw new Error("tableNumber missing");

  const body = {
    menuItemVariantId,
    quantity,
    addons: addons.map(a => ({
      addonId: a.addonId,
      additionalCharge: a.additionalCharge ?? 0,
    })),
    customizations: customizations.map(c => ({
      customizationOptionId: c.customizationOptionId,
      customizationOptionName: c.customizationOptionName,
      additionalCharge: c.additionalCharge ?? 0,
    })),
    specialInstructions,
    sessionId,
    tableNumber
  };

  console.log(" NEW MENU ADD BODY:", body);

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
  {
    menuItemVariantId,
    quantity = 1,
    sessionId,
    tableNumber
  },
  token
) => {

  if (!organizationId) throw new Error("organizationId missing");
  if (!menuItemVariantId) throw new Error("menuItemVariantId missing");
  if (!sessionId) throw new Error("sessionId missing");
  if (!tableNumber) throw new Error("tableNumber missing");

  const body = {
    menuItemVariantId,
    quantity,
    addons: [],
    customizations: [],
    specialInstructions: "",
    sessionId,
    tableNumber
  };

  const res = await fetch(
    `${API_BASE}/cart/add-items/${organizationId}`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) throw new Error(await res.text());

  return true;
};


// ---------------------------------------------
// CHANGE QUANTITY (PUT)
// PUT /v1/cart/change-quantity
// ---------------------------------------------
export const changeCartQuantity = async (cartItemId, newQuantity, token) => {
  if (!cartItemId) throw new Error("cartItemId missing");
  if (newQuantity == null) throw new Error("newQuantity missing");

  const params = new URLSearchParams({
    cartItemId,
    newQuantity,
  });

  const res = await fetch(
    `${API_BASE}/cart/change-quantity?${params.toString()}`,
    {
      method: "PUT",
      headers: authHeaders(token),
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

// ---------------------------------------------
// VALIDATE CART
// POST /v1/cart/{organizationId}/{sessionId}/validate
// ---------------------------------------------
export const validateCartAPI = async (organizationId, sessionId, token) => {
  if (!organizationId) throw new Error("organizationId missing");
  if (!sessionId) throw new Error("sessionId missing");

  const url = `${API_BASE}/cart/${organizationId}/${sessionId}/validate`;

  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(token),
  });

  // Return backend message even if 500
  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { message: text };
  }

  if (!res.ok) {
    //  Return { ok: false, message: "...error..." }
    return { ok: false, message: json.message || "Validation failed" };
  }

  // Return SUCCESS
  return { ok: true, message: json.message || "Cart valid" };
};
