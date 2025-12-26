import { useEffect, useState } from "react";
import { fetchMenuItemById } from "../api/customerMenuAPI";
import { addItemToCart } from "../api/customerCartAPI";
import { useSession } from "../../context/SessionContext";
import "./customerMenuItemDetails.css";

const CustomerMenuItemDetails = ({ itemId, onClose }) => {
  const [itemDetails, setItemDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedVariant, setSelectedVariant] = useState(null);

  // Add-ons → { addonId: quantity }
  const [addonQuantities, setAddonQuantities] = useState({});

  // Customizations → { groupId: [optionIds] }
  const [selectedCustomizations, setSelectedCustomizations] = useState({});

  const [addingToCart, setAddingToCart] = useState(false);

  const { orgId, tableId, sessionId } = useSession();

  /* ================= FETCH ITEM ================= */
  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await fetchMenuItemById(itemId);

        const variants = data.variants || [];
        const availableAddons = data.availableAddons || [];
        const customizationGroups = data.customizationGroups || [];

        setItemDetails({
          ...data,
          variants,
          availableAddons,
          customizationGroups,
        });

        // Default Variant
        const defaultVariant =
          variants.find((v) => v.isDefault) || variants[0] || null;
        setSelectedVariant(defaultVariant);

        // Default Addons
        const addonDefaults = {};
        availableAddons.forEach((addon) => {
          addonDefaults[addon.id] = addon.isDefault ? 1 : 0;
        });
        setAddonQuantities(addonDefaults);

        // Default Customizations
        const customizationDefaults = {};
        customizationGroups.forEach((group) => {
          const defaults = group.options
            ?.filter((opt) => opt.isDefault)
            .map((opt) => opt.id);

          customizationDefaults[group.id] = defaults || [];
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

  /* ================= HANDLERS ================= */
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
        return { ...prev, [group.id]: [option.id] };
      }

      if (group.selectionType === "MULTIPLE") {
        if (current.includes(option.id)) {
          return {
            ...prev,
            [group.id]: current.filter((id) => id !== option.id),
          };
        }

        if (current.length >= group.maxSelections) return prev;

        return { ...prev, [group.id]: [...current, option.id] };
      }

      return prev;
    });
  };

  /* ================= PRICE ================= */
  const calculateTotal = () => {
    let total = 0;

    total += selectedVariant?.price || 0;

    itemDetails?.availableAddons?.forEach((addon) => {
      const qty = addonQuantities[addon.id] || 0;
      total += addon.price * qty;
    });

    itemDetails?.customizationGroups?.forEach((group) => {
      const selectedIds = selectedCustomizations[group.id] || [];
      group.options.forEach((opt) => {
        if (selectedIds.includes(opt.id)) {
          total += opt.additionalPrice;
        }
      });
    });

    return total;
  };

  const totalPrice = itemDetails ? calculateTotal() : 0;

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert("Please select a variant");
      return;
    }

    if (!orgId || !tableId || !sessionId) {
      alert("Session info missing. Please reload.");
      return;
    }

    try {
      setAddingToCart(true);

      const payload = {
        menuItemVariantId: Number(selectedVariant.id),
        quantity: 1,
        addons: Object.entries(addonQuantities)
          .filter(([, qty]) => qty > 0)
          .map(([addonId, qty]) => ({
            addonId: Number(addonId),
            quantity: Number(qty),
          })),
        customizations: Object.entries(selectedCustomizations).flatMap(
          ([, optionIds]) =>
            optionIds.map((optId) => ({
              customizationOptionId: Number(optId),
            }))
        ),
        specialInstructions: "",
        sessionId,
        tableNumber: tableId,
      };

      await addItemToCart({
        orgId,
        ...payload,
      });

      alert("Item added to cart 🛒");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  /* ================= UI ================= */
  if (loading)
    return (
      <div className="item-modal-backdrop">
        <div className="item-modal">Loading...</div>
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

            {/* CUSTOMIZATIONS */}
            {customizationGroups?.length > 0 && (
              <div className="customization-section">
                <h3>Customizations</h3>
                {customizationGroups.map((group) => (
                  <div key={group.id} className="custom-group">
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
                ))}
              </div>
            )}

            {/* ADDONS */}
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
                        −
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

            {/* TOTAL */}
            <div className="price-actions">
              <h3>Total: ₹{totalPrice}</h3>
              <button
                className="add-btn"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMenuItemDetails;
