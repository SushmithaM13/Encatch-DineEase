const BASE = "http://localhost:8082/dine-ease/api/v1";

export async function updateCustomerDetails({
  sessionId,
  organizationId,
  customerId,
  reservedTableSource
}) {
  console.log("Sending Update Request:", {
    sessionId,
    organizationId,
    customerId,
    reservedTableSource
  });

  const res = await fetch(
    `${BASE}/customer-table-assignments/update/customer-details`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        organizationId,
        customerId,
        reservedTableSource
      })
    }
  );

  if (res.status === 204) {
    // Backend returns NO-CONTENT (normal in PUT)
    return { ok: true };
  }

  if (!res.ok) {
    const msg = await res.text();
    console.error("Backend Error:", msg);
    throw new Error("Failed to update customer details");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {}; // safe JSON parsing
}
