// src/api/WaiterNotificationApi.js

const BASE_URL = "http://localhost:8082/dine-ease/api/v1";

export const getWaiterNotifications = async (waiterId, token) => {
  try {
    const url = new URL(
      `${BASE_URL}/waiter-orders/waiter/notification`
    );
    url.searchParams.append("waiterId", waiterId);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch notifications (${response.status}): ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error fetching waiter notifications:", error);
    throw error;
  }
};
