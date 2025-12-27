import "./customerMenuFilters.css";

const priceOptions = [
  { label: "Any Price", min: "", max: "" },
  { label: "₹0 - ₹199", min: 0, max: 200 },
  { label: "₹200 - ₹399", min: 200, max: 400 },
  { label: "₹400 - ₹699", min: 400, max: 700 },
  { label: "₹700+", min: 700, max: 99999 },
];

const CustomerMenuFilters = ({
  filters,
  itemTypes,
  foodTypes,
  cuisineTypes,
  selectedPriceLabel,
  onUpdateFilter,
  onPriceChange,
  onShowAll,
}) => {
  return (
    <div className="customer-menu-filter-bar">
  <button className="filter-pill all-btn" onClick={onShowAll}>
    All
  </button>

  <select className="filter-select"
    value={filters.itemTypeName}
    onChange={(e) => onUpdateFilter("itemTypeName", e.target.value)}
  >
    <option value="">Item Type</option>
    {itemTypes.map((i) => (
      <option key={i.id} value={i.name}>{i.name}</option>
    ))}
  </select>

  <select className="filter-select"
    value={filters.foodTypeName}
    onChange={(e) => onUpdateFilter("foodTypeName", e.target.value)}
  >
    <option value="">Food Type</option>
    {foodTypes.map((i) => (
      <option key={i.id} value={i.name}>{i.name}</option>
    ))}
  </select>

  <select className="filter-select"
    value={filters.cuisineTypeName}
    onChange={(e) => onUpdateFilter("cuisineTypeName", e.target.value)}
  >
    <option value="">Cuisine</option>
    {cuisineTypes.map((i) => (
      <option key={i.id} value={i.name}>{i.name}</option>
    ))}
  </select>

  <select
    className="filter-select"
    value={selectedPriceLabel}
    onChange={(e) => onPriceChange(e.target.value, priceOptions)}
  >
    {priceOptions.map((p, idx) => (
      <option key={idx} value={p.label}>{p.label}</option>
    ))}
  </select>

  <label className="filter-checkbox">
    <input
      type="checkbox"
      checked={filters.isRecommended === "true"}
      onChange={(e) =>
        onUpdateFilter("isRecommended", e.target.checked ? "true" : "")
      }
    />
    Recommended
  </label>

  <label className="filter-checkbox">
    <input
      type="checkbox"
      checked={filters.isBestseller === "true"}
      onChange={(e) =>
        onUpdateFilter("isBestseller", e.target.checked ? "true" : "")
      }
    />
    Bestseller
  </label>
</div>
  );
};

export default CustomerMenuFilters;
