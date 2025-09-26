// src/api/orders.js

// In-memory store for demo purposes

let ordersStore = {
  newOrders: [
    { table: 1, items: '2x Burger', time: '12:30', ago: '2 min ago', note: 'No onion' },
  ],
  preparing: [
    { table: 2, items: '1x Pizza', time: '12:25', ago: '5 min ago' },
  ],
  ready: [
    { table: 3, items: '1x Pasta', time: '12:20', ago: '10 min ago' },
  ],
};

// Simulate async fetch – returns both arrays and counts
export async function getOrders() {
  const activeOrders = ordersStore.newOrders.length + ordersStore.preparing.length;
  const pending = ordersStore.newOrders.length;
  const completed = ordersStore.ready.length;

  // hardcode or compute out of stock items later
  const outOfStock = 3;

  return Promise.resolve({
    ...ordersStore, // keep the arrays
    activeOrders,
    pending,
    completed,
    outOfStock,
  });
}

// Add a new order to newOrders
export async function addOrder(order) {
  ordersStore.newOrders.push(order);
  return Promise.resolve(order);
}

// Move an order from newOrders to preparing
export async function moveToPreparing(index) {
  const [order] = ordersStore.newOrders.splice(index, 1);
  if (order) ordersStore.preparing.push(order);
  return Promise.resolve(order);
}

// Mark an order ready
export async function markReady(index) {
  const [order] = ordersStore.preparing.splice(index, 1);
  if (order) ordersStore.ready.push(order);
  return Promise.resolve(order);
}
