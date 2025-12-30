import { useEffect, useState, forwardRef } from "react";
import "./customerMenuSection.css";
import {
  fetchMenuItems,
  fetchItemTypes,
  fetchFoodTypes,
  fetchCuisineTypes,
  searchMenuItems,
} from "../api/customerMenuAPI";
import CustomerMenuItemDetails from "./customerMenuItemDetails";
import CustomerMenuFilters from "./customerMenuFilters";
import { useSession } from "../../context/SessionContext";
import { useNavigate } from "react-router-dom";

const CustomerMenuSection = forwardRef(
  ({ searchKeyword, onMenuLoad, externalSelectedItemId, selectedCategory }, ref) => {
    const { tableId, orgId, sessionId } = useSession();
    const navigate = useNavigate();

    const [menuItems, setMenuItems] = useState([]);
    const [fullMenuItems, setFullMenuItems] = useState([]); //Keep ONE immutable menu list for carousel
    const [filteredItems, setFilteredItems] = useState([]); //for category filtering
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItemId, setSelectedItemId] = useState(null);

    const [itemTypes, setItemTypes] = useState([]);
    const [foodTypes, setFoodTypes] = useState([]);
    const [cuisineTypes, setCuisineTypes] = useState([]);
    const [selectedPriceLabel, setSelectedPriceLabel] = useState("Any Price");

    const [filters, setFilters] = useState({
      organizationId: "",
      itemTypeName: "",
      foodTypeName: "",
      cuisineTypeName: "",
      minPrice: "",
      maxPrice: "",
      isRecommended: "",
      isBestseller: "",
    });

    // Redirect if session invalid
    useEffect(() => {
      if (!sessionId || !tableId || !orgId) {
        navigate("/customerLogin", { replace: true });
      }
    }, [sessionId, tableId, orgId, navigate]);

    useEffect(() => {
  if (externalSelectedItemId) {
    setSelectedItemId(externalSelectedItemId);
  }
}, [externalSelectedItemId]);

    // Sync orgId into filters
    useEffect(() => {
      if (orgId) {
        setFilters((prev) => ({
          ...prev,
          organizationId: orgId,
        }));
      }
    }, [orgId]);

    // Load dropdowns once
    useEffect(() => {
      if (!orgId) return;

      Promise.all([
        fetchItemTypes(orgId),
        fetchFoodTypes(orgId),
        fetchCuisineTypes(orgId),
      ])
        .then(([item, food, cuisine]) => {
          setItemTypes(item);
          setFoodTypes(food);
          setCuisineTypes(cuisine);
        })
        .catch(console.error);
    }, [orgId]);

    // BACKEND FILTERING - Fetch menu items on filter change
    useEffect(() => {
  if (!filters.organizationId) return;

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await fetchMenuItems(filters);

      setMenuItems(data);
      setFilteredItems(data); //currently no category filter applied

      // only set full list ONCE
      setFullMenuItems((prev) =>
        prev.length === 0 ? data : prev
      );

      // send ONLY full menu to parent
      if (fullMenuItems.length === 0) {
        onMenuLoad?.(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  loadMenu();
}, [filters]);


    // Search (separate API)
    useEffect(() => {
      if (!orgId) return;

  if (!searchKeyword || searchKeyword.trim() === "") {
    // setFilteredItems(menuItems);
    return;
  }

      const delayDebounce = setTimeout(async () => {
        try {
          const results = await searchMenuItems(orgId, searchKeyword.trim());
          setMenuItems(results);
          setFilteredItems(results);
        } catch (e) {
          console.error("Search failed:",e);
        }
      }, 400);

      return () => clearTimeout(delayDebounce);
    }, [searchKeyword, orgId]);

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

    const updateFilter = (key, value) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleShowAll = () => {
      setFilters({
        organizationId: orgId,
        itemTypeName: "",
        foodTypeName: "",
        cuisineTypeName: "",
        minPrice: "",
        maxPrice: "",
        isRecommended: "",
        isBestseller: "",
      });
      setSelectedPriceLabel("Any Price");
    };

     //  Apply category + itemType filters
useEffect(() => {
  if (!menuItems) return;
  // If searching, DO NOT apply category filter
  if (searchKeyword && searchKeyword.trim() !== "") return;

  let items = [...menuItems];

  if (selectedCategory) {
    items = items.filter(
      (item) =>
        item.categoryName?.toLowerCase() ===
        selectedCategory.name?.toLowerCase()
    );
  }
  setFilteredItems(items);
}, [selectedCategory, menuItems, searchKeyword]);

const handlePriceChange = (label, priceOptions) => {
      const range = priceOptions.find((p) => p.label === label);
      if (!range) return;

      setSelectedPriceLabel(label);
      setFilters((prev) => ({
        ...prev,
        minPrice: range.min,
        maxPrice: range.max,
      }));
    };

    if (loading) return <p>🍽️ Loading menu...</p>;
    if (error) return <p>⚠️ {error}</p>;

 return (
    <div className="customer-menu-main-container" ref={ref}>

      {/* Menu */}
      <section className="customer-menu-section">
        <h2 className="customer-menu-section-heading">
  {!searchKeyword && "🍴 Explore Our Menu"}
</h2>

        {/* Filter Bar */}
        {!searchKeyword && (
         <CustomerMenuFilters
         filters={filters}
              itemTypes={itemTypes}
              foodTypes={foodTypes}
              cuisineTypes={cuisineTypes}
              selectedPriceLabel={selectedPriceLabel}
              onUpdateFilter={updateFilter}
              onPriceChange={handlePriceChange}
              onShowAll={handleShowAll}
         />
        )}

        {/* Menu Grid */}
        <div className="customer-menu-grid">
          {filteredItems.length === 0 ? (
            <p className="customer-menu-no-items">No menu items found.</p>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="customer-menu-card" onClick={() => setSelectedItemId(item.id)}>
                <div className="customer-menu-img-wrap">
                  <img src={`data:image/jpeg;base64,${item.imageData}`} alt={item.itemName} />
                  {item.isRecommended && <span className="customer-badge bestseller">⭐ Recommended</span>}
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
    </div>
  );

}
);

export default CustomerMenuSection;

