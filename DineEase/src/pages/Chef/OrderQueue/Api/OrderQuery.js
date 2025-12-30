const BASE_URL = "http://localhost:8082/dine-ease/api/v1";

/* =====================================================
   Common fetch wrapper with Authorization
===================================================== */
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "API request failed");
  }

  return response.json();
};

/* =====================================================
   Get Staff / Chef Profile
===================================================== */
export const getStaffProfile = () => {
  return fetchWithAuth(`${BASE_URL}/staff/profile`, {
    method: "GET",
  });
};

/* =====================================================
   Get Chef Orders (GROUPED BY ORDER REFERENCE)
===================================================== */
export const getChefOrders = async ({ organizationId, chefId, status }) => {
  const params = new URLSearchParams({
    organizationId,
    chefId,
    status,
  }).toString();

  const response = await fetchWithAuth(
    `${BASE_URL}/chef-notifications/all/orders?${params}`,
    { method: "GET" }
  );

  /* ---------------------------------------------
     Transform flat API response
     → Group by orderReference
  --------------------------------------------- */
  const groupedOrders = {};

  response.forEach((row) => {
    const orderKey = row.orderReference;

    if (!groupedOrders[orderKey]) {
      groupedOrders[orderKey] = {
        chefNotificationId: row.chefNotificationId,
        chefId: row.chefId,
        tableNumber: row.tableNumber,
        orderReference: row.orderReference,
        orderItems: [],
      };
    }

    if (row.orderItem) {
      groupedOrders[orderKey].orderItems.push(row.orderItem);
    }
  });

  return Object.values(groupedOrders);
};

/* =====================================================
   Update Order Item Status
===================================================== */
export const updateOrderItemStatus = ({
  organizationId,
  orderItemId,
  itemStatus,
  notes = "",
}) => {
  return fetchWithAuth(
    `${BASE_URL}/${organizationId}/orders/order-item/status`,
    {
      method: "PUT",
      body: JSON.stringify({
        orderItemId,
        itemStatus,
        notes,
      }),
    }
  );
};

/* =====================================================
   Mark Menu Item Out Of Stock
===================================================== */
export const markMenuOutOfStock = ({ organizationId, menuId }) => {
  return fetchWithAuth(
    `${BASE_URL}/${organizationId}/menu/${menuId}/availability`,
    {
      method: "PUT",
      body: JSON.stringify({
        available: false,
        reason: "Out of Stock",
      }),
    }
  );
};
