import { useEffect, useState } from "react";
import { fetchMenuItemById } from "../api/customerMenuAPI";
import "./customerMenuItemDetails.css";

const CustomerMenuItemDetails = ({ itemId, onClose }) => {
  const [itemDetails, setItemDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedVariant, setSelectedVariant] = useState(null);

  // Add-ons: { addonId: quantity }
  const [addonQuantities, setAddonQuantities] = useState({});

  // Customizations → { groupId: [optionIds] }
  const [selectedCustomizations, setSelectedCustomizations] = useState({});

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await fetchMenuItemById(itemId);
        setItemDetails(data);

        // Default variant
        const defaultVar =
          data.variants?.find((v) => v.isDefault) || data.variants?.[0];
        setSelectedVariant(defaultVar);

        // Default Addons → All quantities start at 0
        const addonDefaults = {};
        data.availableAddons?.forEach((a) => {
          addonDefaults[a.id] = a.isDefault ? 1 : 0;
        });
        setAddonQuantities(addonDefaults);

        // Default Customizations
        const customizationDefaults = {};
        data.customizationGroups?.forEach((group) => {
          const defaults = group.options
            .filter((opt) => opt.isDefault)
            .map((opt) => opt.id);

          customizationDefaults[group.id] = defaults.length
            ? defaults
            : group.selectionType === "SINGLE"
            ? [] // for single: user must choose
            : [];
        });

        setSelectedCustomizations(customizationDefaults);
      } catch (err) {
        console.error(err);
        setError("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [itemId]);

  // ----------------------------------------
  // EVENT HANDLERS
  // ----------------------------------------

  const handleAddonChange = (addon, action) => {
    setAddonQuantities((prev) => {
      const currentQty = prev[addon.id] || 0;

      if (action === "inc" && currentQty < addon.maxQuantity) {
        return { ...prev, [addon.id]: currentQty + 1 };
      }

      if (action === "dec" && currentQty > 0) {
        return { ...prev, [addon.id]: currentQty - 1 };
      }

      return prev;
    });
  };

  const handleCustomizationChange = (group, option) => {
    setSelectedCustomizations((prev) => {
      const current = prev[group.id] || [];

      if (group.selectionType === "SINGLE") {
        // Replace existing selection with only one
        return { ...prev, [group.id]: [option.id] };
      }

      if (group.selectionType === "MULTIPLE") {
        const alreadySelected = current.includes(option.id);

        if (alreadySelected) {
          // remove
          return {
            ...prev,
            [group.id]: current.filter((id) => id !== option.id),
          };
        }

        // If maxSelections reached, do not add more
        if (current.length >= group.maxSelections) return prev;

        return { ...prev, [group.id]: [...current, option.id] };
      }

      return prev;
    });
  };

  // ----------------------------------------
  // PRICE CALCULATION
  // ----------------------------------------
  const calculateTotal = () => {
    let total = 0;

    // Variant price
    total += selectedVariant?.price || 0;

    // Addons
    itemDetails.availableAddons?.forEach((addon) => {
      const qty = addonQuantities[addon.id] || 0;
      total += addon.price * qty;
    });

    // Customizations
    itemDetails.customizationGroups?.forEach((group) => {
      const selectedOptIds = selectedCustomizations[group.id] || [];

      group.options.forEach((opt) => {
        if (selectedOptIds.includes(opt.id)) {
          total += opt.additionalPrice;
        }
      });
    });

    return total;
  };

  const totalPrice = itemDetails ? calculateTotal() : 0;

  // ----------------------------------------
  // RENDER UI
  // ----------------------------------------
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
    variants,
    availableAddons,
    customizationGroups,
    itemType,
    cuisineType,
    categoryName,
    spiceLevel,
    preparationTime,
    allergenInfo,
  } = itemDetails;

  const imageSrc = imageData
    ? `data:image/jpeg;base64,${imageData}`
    : "/no-image.jpg";

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

            {/* VARIANTS */}
            {variants?.length > 0 && (
              <div className="variants-section">
                <h4>Select Variant</h4>
                <div className="variant-buttons">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      className={
                        selectedVariant?.id === v.id
                          ? "variant-btn active"
                          : "variant-btn"
                      }
                      onClick={() => setSelectedVariant(v)}
                    >
                      {v.variantName} (₹{v.price})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CUSTOMIZATION GROUPS */}
            {customizationGroups?.length > 0 && (
              <div className="customization-section">
                <h3>Customizations</h3>

                {customizationGroups.map((group) => (
                  <div key={group.id} className="custom-group">
                    <div className="group-options">
                      {group.options.map((opt) => {
                        const selected =
                          selectedCustomizations[group.id]?.includes(opt.id);

                        return (
                          <label key={opt.id} className="custom-option">
                            <input
                              type={
                                group.selectionType === "SINGLE"
                                  ? "radio"
                                  : "checkbox"
                              }
                              name={`group-${group.id}`}
                              checked={selected}
                              onChange={() =>
                                handleCustomizationChange(group, opt)
                              }
                            />
                            {opt.optionName} (+₹{opt.additionalPrice})
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ADD-ONS */}
            {availableAddons?.length > 0 && (
              <div className="addons-section">
                <h4>Add-ons</h4>

                {availableAddons.map((addon) => (
                  <div key={addon.id} className="addon-row">
                    <span>
                      {addon.name} (₹{addon.price})
                    </span>

                    <div className="addon-qty">
                      <button
                        onClick={() => handleAddonChange(addon, "dec")}
                        disabled={(addonQuantities[addon.id] || 0) <= 0}
                      >
                        -
                      </button>
                      <span>{addonQuantities[addon.id] || 0}</span>
                      <button
                        onClick={() => handleAddonChange(addon, "inc")}
                        disabled={
                          (addonQuantities[addon.id] || 0) >= addon.maxQuantity
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TOTAL PRICE */}
            <div className="price-actions">
              <h3>Total: ₹{totalPrice}</h3>

              <button className="add-btn">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMenuItemDetails;
