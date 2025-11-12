import { useEffect, useState } from "react";
import "./customerMenuSection.css";
import { fetchMenuItems, searchMenuItems } from "../api/customerMenuAPI"; // import API function
import { useCustomer } from "../../context/CustomerContext";
import CustomerMenuItemDetails from "./customerMenuItemDetails";
import CustomerBestsellerCarousel from "./CustomerBestsellerCarousel";

const CustomerMenuSection = ({selectedCategory,searchKeyword, ref, onMenuLoad}) => {
  const { orgId } = useCustomer();
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [itemTypeFilter, setItemTypeFilter] = useState("ALL");


  useEffect(() => {
    if (!orgId) {
      console.warn("⚠️ Organization ID missing, skipping fetch");
      setError("Organization ID missing");
      setLoading(false);
      return;
    }

    console.log("🍽️ Fetching menu for organization ID:", orgId);

    const loadMenu = async () => {
      try {
        const data = await fetchMenuItems(orgId); //  use helper function
        console.log("Menu data fetched:", data);
        setMenuItems(data);
        setFilteredItems(data);
        if (onMenuLoad) onMenuLoad(data); // pass menu items to parent
      } catch (err) {
        setError(err.message || "Failed to fetch menu");
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [orgId]);

  useEffect(() => {
    if(!orgId) return;
    if (!searchKeyword || searchKeyword.trim() === "") {
      setFilteredItems(menuItems);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await searchMenuItems(orgId, searchKeyword);
        setFilteredItems(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    },400); // debounce 400ms
    return () => clearTimeout(delayDebounce);
  },[searchKeyword, orgId, menuItems]);

  // Helper to get correct variant price
  const getDefaultVariantPrice = (item) => {
    if (!item?.variants?.length) return 0;
    const defaultVariant = item.variants.find((v) => v.isDefault);
    if (defaultVariant) {
      return defaultVariant.finalPrice > 0
        ? defaultVariant.finalPrice
        : defaultVariant.price;
    }
    const firstVariant = item.variants[0];
    return firstVariant.finalPrice > 0 ? firstVariant.finalPrice : firstVariant.price;
  };

 //  Apply category + itemType filters
  useEffect(() => {
    let items = menuItems;

    if (selectedCategory) {
      items = items.filter(
        (item) =>
          item.categoryName?.toLowerCase() ===
          selectedCategory.name?.toLowerCase()
      );
    }

    if (itemTypeFilter !== "ALL") {
      items = items.filter((item) => item.itemType === itemTypeFilter);
    }

    setFilteredItems(items);
  }, [selectedCategory, menuItems, itemTypeFilter]);


  if (loading) return <p className="loading-text">🍽️ Loading menu...</p>;
  if (error) return <p className="error-text">⚠️ {error}</p>;

 return (
    <main className="customer-menu-main-container" ref={ref}>
      {/* Bestseller */}
      {!searchKeyword && (
        <section className="customer-bestseller-section">
          <CustomerBestsellerCarousel
            items={menuItems}
            onItemSelect={(id) => setSelectedItemId(id)}
          />
        </section>
      )}

      {/* Menu */}
      <section className="customer-menu-section">
        <h2 className="customer-menu-section-heading">
  {!searchKeyword && "🍴 Explore Our Menu"}
</h2>

        {/* Filter Bar */}
        {!searchKeyword && (
          <div className="customer-menu-filter-bar">
            {["ALL", "VEG", "NON-VEG"].map((type) => (
              <button
                key={type}
                className={`customer-menu-filter-btn ${
                  itemTypeFilter === type ? "active" : ""
                }`}
                onClick={() => setItemTypeFilter(type)}
              >
                {type === "ALL" ? "All Items" : type === "VEG" ? "Veg 🌿" : "Non-Veg 🍗"}
              </button>
            ))}
          </div>
        )}

        {/* Menu Grid */}
        <div className="customer-menu-grid">
          {filteredItems.length === 0 ? (
            <p className="customer-menu-no-items">No menu items found.</p>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="customer-menu-card">
                <div className="customer-menu-img-wrap">
                  <img src={`data:image/jpeg;base64,${item.imageData}`} alt={item.itemName} />
                  {item.isBestseller && <span className="badge bestseller">🔥 Bestseller</span>}
                </div>

                <div className="customer-menu-info">
                  <h3 className="customer-menu-name">{item.itemName}</h3>
                  <p className="customer-menu-desc">{item.description}</p>

                  <p className="customer-menu-type">
                    <span
                      className={item.itemType === "VEG" ? "veg-dot" : "nonveg-dot"}
                    ></span>
                    {item.itemType} • {item.cuisineType}
                  </p>

                  <div className="customer-menu-price-add">
                    <p className="customer-menu-price">
                      ₹{getDefaultVariantPrice(item)}
                    </p>
                    <button
                      className="customer-add-btn"
                      onClick={() => setSelectedItemId(item.id)}
                    >
                      Add +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Item Details */}
      {selectedItemId && (
        <CustomerMenuItemDetails
          itemId={selectedItemId}
          onClose={() => setSelectedItemId(null)}
        />
      )}
    </main>
  );

};

export default CustomerMenuSection;
