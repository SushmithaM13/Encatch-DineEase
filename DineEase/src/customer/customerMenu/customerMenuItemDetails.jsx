import { useEffect, useState } from "react";
import { fetchMenuItemById } from "../api/customerMenuAPI";
import "./customerMenuItemDetails.css";

const CustomerMenuItemDetails = ({ itemId, onClose }) => {
  const [itemDetails, setItemDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await fetchMenuItemById(itemId);
        setItemDetails(data);
        // Default variant
        const defaultVar = data.variants?.find((v) => v.isDefault) || data.variants?.[0];
        setSelectedVariant(defaultVar);
      } catch (err) {
        setError("Failed to load item details",err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [itemId]);

  if (loading)
    return (
      <div className="item-modal-backdrop">
        <div className="item-modal">
          <p>Loading item details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="item-modal-backdrop">
        <div className="item-modal">
          <p>{error}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );

  if (!itemDetails) return null;

  const {
    itemName,
    description,
    imageData,
    itemType,
    cuisineType,
    categoryName,
    variants,
    availableAddons,
    allergenInfo,
    spiceLevel,
    preparationTime,
  } = itemDetails;

  const imageSrc = imageData
    ? `data:image/jpeg;base64,${imageData}`
    : "/no-image.jpg";

  const handleAddonToggle = (addonId) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const totalPrice =
    (selectedVariant?.finalPrice || 0) +
    availableAddons
      ?.filter((a) => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="item-modal-backdrop" onClick={onClose}>
      <div className="item-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="item-details-content">
          <img src={imageSrc} alt={itemName} className="item-details-img" />

          <div className="item-details-info">
            <h2>{itemName}</h2>
            <p className="item-desc">{description}</p>
            <p className="item-meta">
              {itemType} • {cuisineType} • {categoryName}
            </p>
            <p className="item-extra">
              <strong>Prep Time:</strong> {preparationTime} mins <br />
              <strong>Allergens:</strong> {allergenInfo || "None"} <br />
              <strong>Spice Level:</strong> {spiceLevel}
            </p>

            {/* Variants */}
            {variants?.length > 0 && (
              <div className="variants-section">
                <h4>Choose Size / Variant:</h4>
                <select
                  value={selectedVariant?.id}
                  onChange={(e) =>
                    setSelectedVariant(
                      variants.find((v) => v.id === Number(e.target.value))
                    )
                  }
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.displayText}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Addons */}
            {availableAddons?.length > 0 && (
              <div className="addons-section">
                <h4>Add-ons:</h4>
                {availableAddons.map((addon) => (
                  <label key={addon.id} className="addon-option">
                    <input
                      type="checkbox"
                      checked={selectedAddons.includes(addon.id)}
                      onChange={() => handleAddonToggle(addon.id)}
                    />
                    {addon.name} (+₹{addon.price})
                  </label>
                ))}
              </div>
            )}

            <div className="price-actions">
              <h3>Total: ₹{totalPrice}</h3>
              <button className="add-btn">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMenuItemDetails;
