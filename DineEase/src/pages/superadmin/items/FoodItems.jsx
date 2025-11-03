import React, { useState } from "react";
import "./FoodItems.css";

const FoodItems = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "", image: "", available: true });

  const [itemsData, setItemsData] = useState({
    "Main Course": {
      Veg: [
        { id: 1, name: "Paneer Butter Masala", price: 12.99, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300", available: true },
        { id: 2, name: "Veg Korma", price: 11.99, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300", available: true },
      ],
      "Non Veg": [
        { id: 3, name: "Chicken Curry", price: 15.99, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300", available: true },
        { id: 4, name: "Mutton Rogan Josh", price: 18.99, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300", available: false },
      ],
    },
    Starters: {
      Veg: [
        { id: 5, name: "Spring Rolls", price: 7.99, image: "https://images.unsplash.com/photo-1563379091339-03246963d25a?w=300", available: true },
        { id: 6, name: "Paneer Tikka", price: 9.99, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300", available: true },
      ],
      "Non Veg": [
        { id: 7, name: "Chicken Wings", price: 10.99, image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=300", available: true },
        { id: 8, name: "Fish Fingers", price: 9.99, image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=300", available: false },
      ],
    },
    Tiffins: {
      North: [
        { id: 9, name: "Paratha", price: 4.99, image: "https://images.unsplash.com/photo-1574653795744-8dd2837e3a2e?w=300", available: true },
        { id: 10, name: "Chole Bhature", price: 6.99, image: "https://images.unsplash.com/photo-1606471191009-63559c8be84d?w=300", available: true },
      ],
      South: [
        { id: 11, name: "Idli", price: 3.99, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300", available: true },
        { id: 12, name: "Dosa", price: 5.99, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300", available: true },
      ],
    },
    Breads: [
      { id: 13, name: "Naan", price: 2.99, image: "https://images.unsplash.com/photo-1574653795744-8dd2837e3a2e?w=300", available: true },
      { id: 14, name: "Roti", price: 1.99, image: "https://images.unsplash.com/photo-1574653795744-8dd2837e3a2e?w=300", available: true },
      { id: 15, name: "Paratha", price: 3.99, image: "https://images.unsplash.com/photo-1574653795744-8dd2837e3a2e?w=300", available: false },
    ],
    Desserts: [
      { id: 16, name: "Gulab Jamun", price: 4.99, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300", available: true },
      { id: 17, name: "Ice Cream", price: 3.99, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300", available: true },
    ],
  });

  const toggleAvailability = (itemId, category, subCat = null) => {
    setItemsData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (subCat) {
        newData[category][subCat] = newData[category][subCat].map(item =>
          item.id === itemId ? { ...item, available: !item.available } : item
        );
      } else {
        newData[category] = newData[category].map(item =>
          item.id === itemId ? { ...item, available: !item.available } : item
        );
      }
      return newData;
    });
  };

  const renderItems = () => {
    if (!activeCategory) return <p>Select a category</p>;
    const categoryData = itemsData[activeCategory];

    if (typeof categoryData === "object" && !Array.isArray(categoryData)) {
      if (!subCategory) return <p>Select a sub-category</p>;
      return categoryData[subCategory].map((item) => (
        <div key={item.id} className={`food-item-card ${!item.available ? 'unavailable' : ''}`}>
          <div className="item-image">
            <img src={item.image} alt={item.name} />
            {!item.available && <div className="unavailable-overlay">Not Available</div>}
          </div>
          <div className="item-details">
            <h4>{item.name}</h4>
            <p className="item-price">${item.price}</p>
            <div className="item-actions">
              <div className="toggle-switch">
                <button
                  type="button"
                  className={`toggle-button ${item.available ? 'active' : 'inactive'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleAvailability(item.id, activeCategory, subCategory);
                  }}
                >
                  <span className="toggle-slider">
                    <span className="toggle-knob"></span>
                  </span>
                  <span className="toggle-text">{item.available ? 'Available' : 'Unavailable'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ));
    }

    return categoryData.map((item) => (
      <div key={item.id} className={`food-item-card ${!item.available ? 'unavailable' : ''}`}>
        <div className="item-image">
          <img src={item.image} alt={item.name} />
          {!item.available && <div className="unavailable-overlay">Not Available</div>}
        </div>
        <div className="item-details">
          <h4>{item.name}</h4>
          <p className="item-price">${item.price}</p>
          <div className="item-actions">
            <div className="toggle-switch">
              <button
                type="button"
                className={`toggle-button ${item.available ? 'active' : 'inactive'}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleAvailability(item.id, activeCategory);
                }}
              >
                <span className="toggle-slider">
                  <span className="toggle-knob"></span>
                </span>
                <span className="toggle-text">{item.available ? 'Available' : 'Unavailable'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.image.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newItem = {
      id: Date.now() + Math.random(),
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      image: formData.image.trim(),
      available: formData.available
    };

    setItemsData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (subCategory) {
        newData[activeCategory][subCategory] = [...newData[activeCategory][subCategory], newItem];
      } else if (newData[activeCategory] && Array.isArray(newData[activeCategory])) {
        newData[activeCategory] = [...newData[activeCategory], newItem];
      }
      return newData;
    });

    setFormData({ name: "", price: "", image: "", available: true });
    setShowPopup(false);
  };

  return (
    <div className="food-page">
      <div className="content">
        <h1 className="page-title">Menu Management</h1>
        <div className="header-bar">
          {["Main Course", "Starters", "Tiffins", "Breads", "Desserts"].map(
            (cat) => (
              <button
                key={cat}
                className={activeCategory === cat ? "active" : ""}
                onClick={() => {
                  setActiveCategory(cat);
                  setSubCategory("");
                }}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Sub-category dropdown */}
        {["Main Course", "Starters", "Tiffins"].includes(activeCategory) && (
          <div className="dropdowns">
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
            >
              <option value="">Select {activeCategory} type</option>
              {Object.keys(itemsData[activeCategory]).map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        )}

        {/* Add button appears above items list */}
        {((activeCategory && (activeCategory === "Breads" || activeCategory === "Desserts")) ||
          (activeCategory && subCategory)) && (
          <div className="add-item-section">
            <button className="add-btn" onClick={() => setShowPopup(true)}>
              + Add Item
            </button>
          </div>
        )}

        <div className="items-grid">{renderItems()}</div>
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add Food Item</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
              <div className="form-group">
                <label>Availability Status</label>
                <label className="availability-toggle">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) =>
                      setFormData({ ...formData, available: e.target.checked })
                    }
                  />
                  <span className="availability-slider"></span>
                  <span className="availability-label">
                    {formData.available ? 'Available' : 'Not Available'}
                  </span>
                </label>
              </div>
              <div className="popup-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setShowPopup(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodItems;
