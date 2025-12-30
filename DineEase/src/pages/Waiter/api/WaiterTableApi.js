// WaiterTableApi.js
const API_BASE = "http://localhost:8082/dine-ease/api/v1";

// --------------------
// Get waiter profile
// --------------------
export const getWaiterProfile = async (token) => {
  if (!token) throw new Error("No token provided");

  const res = await fetch(`${API_BASE}/staff/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

// --------------------
// Get assigned tables by waiter email
// --------------------
export async function getAssignedTables(waiterEmail) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_BASE}/waiter-orders/get/assigned/tables?email=${waiterEmail}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  let data;

  try {
    data = await res.json();
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    return []; // prevent crash
  }

  //  If backend returns error object, NOT array → return empty list
  if (!Array.isArray(data)) {
    console.error("Backend returned NON-ARRAY:", data);
    return [];
  }

  //  Clean null values
  const cleanData = data.map((t) => ({
    ...t,
    reservedTableSource: t.reservedTableSource ?? "NONE"
  }));

  return cleanData;
}





// --------------------
// Reserve Table (Get Session ID)
// --------------------
export const reserveTable = async (organizationId, tableNumber, token) => {
  if (!token) throw new Error("No token provided");

  const body = { organizationId, tableNumber };

  const res = await fetch(
    `${API_BASE}/customer-table-assignments/reserve-table`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    // If backend failed, read error message (if any) safely
    const errorText = await res.text();
    throw new Error(errorText || "Failed to reserve table");
  }

  // Read JSON response once
  const data = await res.json(); // data = { sessionId: "..." }

  if (!data.sessionId) throw new Error("Session not created");

  // Update customer details only after session is created
  await updateCustomerDetails(data.sessionId, organizationId, "WAITER", null, token);

  return data; // return { sessionId: "..." }
};


// --------------------
// Update table status
// --------------------
export const updateTableStatus = async (
  tableNumber,
  newStatus,
  organizationId,
  token
) => {
  if (!token) throw new Error("No token provided");
  const url = `${API_BASE}/restaurant-tables/update/status?organizationId=${organizationId}&tableNumber=${tableNumber}&status=${newStatus}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to update table status");
  return res.json();
};

// --------------------
// Update Table Customer Source (CUSTOMER / GUEST / WAITER)
// --------------------
export async function updateCustomerDetails(
  sessionId,
  orgId,
  reservedTableSource,
  customerId,
  token
) {
  const res = await fetch(
    `${API_BASE}/customer-table-assignments/update/customer-details`,
    {
      method: "PUT",    
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId,
        organizationId: orgId,
        customerId,
        reservedTableSource, 
      }),
    }
  );

  // Backend returns empty body → avoid JSON parse crash
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || "Failed to update table source");
  }

  return data;
}

