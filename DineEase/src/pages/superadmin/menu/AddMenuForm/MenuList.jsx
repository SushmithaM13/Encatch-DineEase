// src/menu/MenuList/MenuList.jsx
import { useEffect, useState } from "react";

export default function MenuList() {
  const [menu, setMenu] = useState([]);

  // Fetch menu from backend
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const orgId = localStorage.getItem("orgId"); // or use your own method
        const res = await fetch(`http://localhost:8082/dine-ease/api/v1/menu/full/${orgId}`);
        const data = await res.json();
        setMenu(data || []);
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      }
    };
    fetchMenu();
  }, []);

  return (
    <div className="menu-list">
      {menu.map((category) => (
        <div key={category.categoryId} className="category-section">
          <h2 className="category-title">{category.categoryName}</h2>
          <div className="items-grid">
            {category.items?.map((item) => (
              <div key={item.id} className="menu-item-card">
                <img
                  src={item.imageUrl}
                  alt={item.itemName}
                  className="menu-item-image"
                />
                <h3>{item.itemName}</h3>
                <p>{item.description}</p>

                {item.variants?.length > 0 && (
                  <div className="variants">
                    <strong>Variants:</strong>
                    <ul>
                      {item.variants.map((v) => (
                        <li key={v.id}>
                          {v.variantName} - ₹{v.finalPrice}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.availableAddons?.length > 0 && (
                  <div className="addons">
                    <strong>Addons:</strong>
                    <ul>
                      {item.availableAddons.map((a) => (
                        <li key={a.id}>
                          {a.name} - ₹{a.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button className="add-to-cart-btn">Add to Cart</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
