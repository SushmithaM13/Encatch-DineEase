const BASE = "http://localhost:8082/dine-ease/api/v1";

export async function checkTableStatus(organizationId, tableNumber) {
  const url = `${BASE}/restaurant-tables/check-table-status?organizationId=${organizationId}&tableNumber=${tableNumber}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to check table status");
  return await res.json(); // true or false
}

export async function reserveTable(organizationId, tableNumber) {
  const res = await fetch(`${BASE}/customer-table-assignments/reserve-table`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId, tableNumber })
  });

  if (!res.ok) throw new Error("Failed to reserve table");

  return await res.json(); // { sessionId }
}

export async function validateSessionId(organizationId, sessionId) {
  const res = await fetch(`${BASE}/customer-table-assignments/validate/sessionId`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId, sessionId })
  });

  // Read raw response
  const text = await res.text();

  // Parse JSON only if body is not empty
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  return { ok: res.ok, data };
}

