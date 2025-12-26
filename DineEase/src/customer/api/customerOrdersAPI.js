import axios from "axios";

const API_BASE_URL = "http://localhost:8082/dine-ease/api/v1";

/* ================= CHECKOUT ORDER ================= */
export const checkoutOrder = async ({ orgId, sessionId, tableNumber, orderType = "DINE_IN" }) => {
  if (!orgId || !sessionId || !tableNumber) throw new Error("Missing required fields");

  const response = await axios.post(
    `${API_BASE_URL}/${orgId}/orders/checkout`,
    { sessionId, tableNumber, orderType },
    { headers: { "Content-Type": "application/json" } }
  );

  return response.data;
};

/* ================= GET ORDERS BY SESSION ================= */
export const getOrdersBySession = async ({ orgId, sessionId }) => {
  if (!orgId || !sessionId) throw new Error("Missing required fields");

  const response = await axios.get(`${API_BASE_URL}/${orgId}/orders/session/${sessionId}`, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
};
