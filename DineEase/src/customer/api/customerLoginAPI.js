const BASE = "http://localhost:8082/dine-ease/api/v1/customers";

export const createCustomer = async (payload) => {
  const res = await fetch(`${BASE}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log("Create customer response data:", data);
  return { ok: res.ok, data };   // FIXED
};

export const verifyOtp = async (identifier, otp) => {
  const res = await fetch(
    `${BASE}/verify-otp?identifier=${encodeURIComponent(identifier)}&otp=${otp}`,
    { method: "POST" }
  );

  const data = await res.json();
  return { ok: res.ok, data };   // FIXED
};

export const resendOtp = async (identifier) => {
  const res = await fetch(
    `${BASE}/resend-otp?identifier=${encodeURIComponent(identifier)}`,
    { method: "POST" }
  );

  const data = await res.json();
  return { ok: res.ok, data };   // FIXED
};
