// src/api/inventory.js
export const getInventory = async () => {
  return [
    { ingredient: 'Salmon Fillet', category: 'Seafood', stock: '15 kg', status: 'Adequate' },
    { ingredient: 'Chicken Breast', category: 'Poultry', stock: '8 kg', status: 'Low' },
    { ingredient: 'Chocolate', category: 'Bakery', stock: '0 kg', status: 'Out of Stock' },
    { ingredient: 'Fresh Vegetables', category: 'Produce', stock: '25 kg', status: 'Adequate' }
  ];
};
