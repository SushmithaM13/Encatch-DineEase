import React, { useEffect, useState } from "react";
import "./ChefMenuCatalog.css";

export default function ChefMenuCatalog() {
  const API_PROFILE = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const API_MENU = "http://localhost:8082/dine-ease/api/v1/menu/getAll";
  const API_UPDATE = "http://localhost:8082/dine-ease/api/v1/menu/update";

  const categories = [
    "All Items",
    "Starters",
    "Main Course",
    "Vegetarian",
    "Non-Vegetarian",
    "Beverages",
    "Desserts",
  ];

  const [token] = useState(localStorage.getItem("Token"));
  const [organizationId, setOrganizationId] = useState(
    localStorage.getItem("chefOrgId")
  );

  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [loading, setLoading] = useState(true);

  const normalize = (str) => str?.toLowerCase().trim();

  // Fetch Profile
  const fetchStaffProfile = async () => {
    try {
      const res = await fetch(API_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data.organizationId) {
        localStorage.setItem("chefOrgId", data.organizationId);
        setOrganizationId(data.organizationId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Menu Items
  const fetchMenuItems = async (orgId) => {
    try {
      const url = `${API_MENU}?organizationId=${orgId}&page=0&size=200`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      const items = Array.isArray(data.content) ? data.content : data;

      const formatted = items.map((i) => ({
        id: i.id,
        name: i.itemName,
        desc: i.description,
        price: i.price || 0,
        img: i.imageData ? `data:image/jpeg;base64,${i.imageData}` : "",
        category: i.categoryName,
        isVeg: i.itemTypeName?.toLowerCase() === "veg",
        inStock: i.isAvailable,

        // Safe defaults for update API
        itemTypeName: i.itemTypeName || "",
        foodTypeName: i.foodTypeName || "",
        cuisineTypeName: i.cuisineTypeName || "",
        spiceLevel: i.spiceLevel || 1,
        preparationTime: i.preparationTime || 1,
        isBestseller: i.isBestseller || false,
        isRecommended: i.isRecommended || false,
        chefSpecial: i.chefSpecial || false,
        allergenInfo: i.allergenInfo || "",

        variants: i.variants || [],
        addons: i.addons || [],
        customizationGroupNames: i.customizationGroupNames || [],

        organizationId: i.organizationId || orgId
      }));

      setMenuItems(formatted);
      setFilteredItems(formatted);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Update Availability Only
 
const toggleStock = async (item) => {
  try {
    const form = new FormData();

    form.append("menuItemId", item.id);
    form.append("organizationId", item.organizationId);
    form.append("itemName", item.name);
    form.append("description", item.desc);
    form.append("categoryName", item.category);
    form.append("itemTypeName", item.itemTypeName);
form.append("foodTypeName", item.foodTypeName);
form.append("cuisineTypeName", item.cuisineTypeName);

    form.append("spiceLevel", item.spiceLevel);
    form.append("preparationTime", item.preparationTime);
    form.append("isRecommended", item.isRecommended);
    form.append("isBestseller", item.isBestseller);
    form.append("chefSpecial", item.chefSpecial);
    form.append("allergenInfo", item.allergenInfo);
    form.append("isAvailable", (!item.inStock).toString());


    // --- image ---
    if (item.image) {
      form.append("image", item.image);
    } 

    // --- variants (backend expects multi-part array) ---
    item.variants.forEach((v, index) => {
      form.append(`variants[${index}].variantId`, v.variantId);
      form.append(`variants[${index}].discountPrice`, v.discountPrice);
      form.append(`variants[${index}].price`, v.price);
      form.append(`variants[${index}].displayOrder`, v.displayOrder);
      form.append(`variants[${index}].quantityUnit`, v.quantityUnit);
      form.append(`variants[${index}].variantName`, v.variantName);
      form.append(`variants[${index}].isDefault`, v.isDefault);
      form.append(`variants[${index}].isAvailable`, v.isAvailable);
      form.append(`variants[${index}].variantType`, v.variantType);
    });

    // --- addons ---
    item.addons.forEach((a, index) => {
      form.append(`addons[${index}].addonName`, a.addonName);
      form.append(`addons[${index}].isDefault`, a.isDefault);
      form.append(`addons[${index}].maxQuantity`, a.maxQuantity);
    });

    // --- customizationGroupNames ---
    item.customizationGroupNames.forEach((g) => {
      form.append("customizationGroupNames", g);
    });

    const res = await fetch(API_UPDATE, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!res.ok) {
      alert("Update failed!");
      return;
    }

    const updated = menuItems.map((m) =>
      m.id === item.id ? { ...m, inStock: !m.inStock } : m
    );

    setMenuItems(updated);
    handleFilter(activeCategory);

  } catch (err) {
    console.error("UPDATE ERROR", err);
  }
};


  // Filter Logic
  const handleFilter = (cat) => {
    setActiveCategory(cat);

    if (cat === "All Items") return setFilteredItems(menuItems);
    if (cat === "Vegetarian")
      return setFilteredItems(menuItems.filter((i) => i.isVeg));
    if (cat === "Non-Vegetarian")
      return setFilteredItems(menuItems.filter((i) => !i.isVeg));

    setFilteredItems(
      menuItems.filter((i) => normalize(i.category) === normalize(cat))
    );
  };

  useEffect(() => {
    if (token) fetchStaffProfile();
  }, [token]);

  useEffect(() => {
    if (organizationId) fetchMenuItems(organizationId);
  }, [organizationId]);

  return (
    <div className="chef-menu-catalog chef-container">
      <h2>🍽 Menu Catalog</h2>

      <div className="chef-category-filter">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`chef-category-btn ${
              activeCategory === cat ? "active" : ""
            }`}
            onClick={() => handleFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : filteredItems.length === 0 ? (
        <p>No Items Found.</p>
      ) : (
        <div className="chef-menu-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="chef-menu-card">
              <div
                className="chef-menu-img"
                style={{ backgroundImage: `url(${item.img})` }}
              ></div>

              <div className="chef-menu-body">
                <div className="chef-menu-title">
                  <span>{item.name}</span>
                  <span className="chef-price">₹{item.price}</span>
                </div>

                <p className="chef-desc">{item.desc}</p>

                <button
                  className={`chef-badge ${
                    item.inStock ? "chef-badge-success" : "chef-badge-error"
                  }`}
                  onClick={() => toggleStock(item)}
                >
                  {item.inStock ? "✔ In Stock" : "✘ Out of Stock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
