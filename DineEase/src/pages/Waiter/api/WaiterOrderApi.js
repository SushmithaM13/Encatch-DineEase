const BASE_URL = "http://localhost:8082/dine-ease/api/v1";

// ------------------------------------------------------
// GET WAITER PROFILE
// ------------------------------------------------------
export const getWaiterProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token provided");

  const res = await fetch(`${BASE_URL}/staff/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

// ------------------------------------------------------
// FETCH ALL WAITER ORDERS (NO ORG ID IN URL)
// GET /v1/waiter-orders/all
// ------------------------------------------------------
export const fetchWaiterOrders = async (page = 0, size = 10) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token provided");

  const res = await fetch(
    `${BASE_URL}/waiter-orders/all?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to fetch waiter orders");
  }

  return res.json();
};

// Update order item status to SERVED

export const updateOrderItemStatus = async (
  organizationId,
  orderItemId,
  token
) => {
  if (!organizationId) throw new Error("organizationId missing");

  const res = await fetch(
    `${BASE_URL}/${organizationId}/orders/order-item/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderItemId,
        itemStatus: "SERVED",
        notes: "Served by waiter",
      }),
    }
  );
   console.log(" Order item status updated to SERVED:", res);
console.log(" order-itemid :", orderItemId);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to update item status");
  }


  return res.json();
 
};

// ------------------------------------------------------
// CHECKOUT / PLACE ORDER
// ------------------------------------------------------
export const checkoutOrder = async (organizationId, body, token) => {
  if (!organizationId) throw new Error("organizationId missing");
  if (!body?.sessionId) throw new Error("sessionId missing");

  const res = await fetch(
    `${BASE_URL}/${organizationId}/orders/checkout`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );
  console.log(" CHECKOUT RESPONSE STATUS:", body);

  if (!res.ok) {
    const err = await res.text();
    console.error("Checkout raw error :", res.text());
    throw new Error(err || "Checkout failed");
  }

  return res.json();
};

// ------------------------------------------------------
// FETCH ALL WAITER ORDERS BY DATE RANGE (WITH PAGINATION)
// GET /waiter-orders/all/dates?startDate=DD/MM/YYYY&endDate=DD/MM/YYYY&page=0&size=10
// ------------------------------------------------------
export const fetchWaiterOrdersByDate = async (
  startDate,
  endDate,
  page = 0,
  size = 10
) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token provided");

  const url = `${BASE_URL}/waiter-orders/all/dates?startDate=${encodeURIComponent(
    startDate
  )}&endDate=${encodeURIComponent(endDate)}&page=${page}&size=${size}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "*/*",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to fetch date-wise waiter orders");
  }

  return res.json();
};
