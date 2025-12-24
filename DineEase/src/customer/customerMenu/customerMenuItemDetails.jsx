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
  const [selectedCustomizations, setSelectedCustomizations] = useState({});
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const { orgId, tableId, sessionId } = useSession();

  /* ================= FETCH MENU ITEM ================= */
  useEffect(() => {
    const loadItem = async () => {
      try {
        const data = await fetchMenuItemById(itemId);
        console.log("🟢 MENU ITEM API RESPONSE:", data);

        const variants =
          data?.variants ||
          data?.menuItemVariants ||
          [];

        const customizationGroups =
          data?.customizations ||
          data?.menuCustomizations ||
          data?.menuItemCustomizations ||
          data?.customizationGroups ||
          [];

        const availableAddons =
          data?.availableAddons ||
          data?.addons ||
          [];

        setItemDetails({
          ...data,
          variants,
          customizationGroups,
          availableAddons,
        });

        setSelectedVariant(
          variants.find(v => v.isDefault) || variants[0] || null
        );

      } catch (err) {
        console.error(err);
        setError("Failed to load menu item");
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [itemId]);

  if (loading) {
    return (
      <div className="item-modal-backdrop">
        <div className="item-modal">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="item-modal-backdrop">
        <div className="item-modal">
          <p>{error}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (!itemDetails) return null;

  const {
    itemName,
    description,
    imageData,
    itemType,
    cuisineType,
    categoryName,
    variants = [],
    customizationGroups = [],
    availableAddons = [],
    allergenInfo,
    spiceLevel,
    preparationTime,
  } = itemDetails;

  const imageSrc = imageData
    ? `data:image/jpeg;base64,${imageData}`
    : "/no-image.jpg";

  /* ================= PRICE ================= */
  const customizationTotal = Object.values(selectedCustomizations)
    .reduce((sum, opt) => sum + (opt?.price || 0), 0);

  const totalPrice =
    ((selectedVariant?.finalPrice || selectedVariant?.price || 0) * quantity) +
    customizationTotal +
    (selectedAddon?.price || 0);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
  if (!selectedVariant) {
    alert("Please select a variant");
    return;
  }

  if (!orgId || !tableId || !sessionId) {
    alert("Session information is missing. Please reload the page.");
    console.error("Missing session info:", { orgId, tableId, sessionId });
    return;
  }

  try {
    setAddingToCart(true);

    const payload = {
      menuItemVariantId: Number(selectedVariant.id),
      quantity: Number(quantity),
      addons: selectedAddon
        ? [{ addonId: Number(selectedAddon.id), additionalCharge: Number(selectedAddon.price) }]
        : [],
      customizations: Object.values(selectedCustomizations).map(opt => ({
        customizationOptionId: Number(opt.id),
        customizationOptionName: opt.name,
        additionalCharge: Number(opt.price),
      })),
      specialInstructions: "",
      sessionId,
      tableNumber: tableId, // keep as string
    };

    console.log("🟢 Add to cart payload:", payload);

    await addItemToCart({
      orgId, // in URL
      ...payload,
    });

    alert("Item added to cart 🛒");
    onClose();

  } catch (err) {
    console.error("Add to cart failed:", err.response?.data || err);
    alert("Failed to add item to cart");
  } finally {
    setAddingToCart(false);
  }
};

  /* ================= UI ================= */
  return (
    <div className="item-modal-backdrop" onClick={onClose}>
      <div className="item-modal" onClick={(e) => e.stopPropagation()}>

        <button className="close-btn" onClick={onClose}>✕</button>

        <img src={imageSrc} alt={itemName} className="item-details-img" />

        <h2>{itemName}</h2>
        <p>{description}</p>

        <p className="item-meta">
          {itemType} • {cuisineType} • {categoryName}
        </p>

        <p className="item-extra">
          Prep: {preparationTime} mins <br />
          Allergens: {allergenInfo || "None"} <br />
          Spice Level: {spiceLevel}
        </p>

        {/* ================= VARIANTS ================= */}
        {variants.length > 0 && (
          <div className="variants-section">
            <h4>Choose Variant</h4>
            <select
              value={selectedVariant?.id || ""}
              onChange={(e) =>
                setSelectedVariant(
                  variants.find(v => v.id === Number(e.target.value))
                )
              }
            >
              {variants.map(v => (
                <option key={v.id} value={v.id}>
                  {v.displayText || v.variantName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ================= CUSTOMIZATION GROUPS ================= */}
        {customizationGroups.length > 0 && customizationGroups.map(group => (
          <div className="customizations-section" key={group.id}>
            <h4>{group.groupName || group.name}</h4>

            <select
              value={selectedCustomizations[group.id]?.id || ""}
              onChange={(e) => {
                const option =
                  group.options?.find(
                    o => o.id === Number(e.target.value)
                  ) || null;

                setSelectedCustomizations(prev => ({
                  ...prev,
                  [group.id]: option
                }));
              }}
            >
              <option value="">None</option>

              {(group.options || group.customizationOptions || []).map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                  {opt.price ? ` (+₹${opt.price})` : ""}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* ================= ADDONS ================= */}
        {availableAddons.length > 0 && (
          <div className="addons-section">
            <h4>Add-ons</h4>
            <select
              value={selectedAddon?.id || ""}
              onChange={(e) =>
                setSelectedAddon(
                  availableAddons.find(a => a.id === Number(e.target.value))
                )
              }
            >
              <option value="">None</option>
              {availableAddons.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} (+₹{a.price})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ================= QUANTITY ================= */}
        <div className="quantity-section">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)}>+</button>
        </div>

        {/* ================= TOTAL ================= */}
        <div className="price-actions">
          <h3>Total: ₹{totalPrice}</h3>
          <button onClick={handleAddToCart} disabled={addingToCart}>
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomerMenuItemDetails;
