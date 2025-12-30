import { useState } from "react";
import { toast } from "react-toastify";
import "./WaiterMenuItemPopup.css";

export default function WaiterMenuItemPopup({ item, onClose, onAddToCart }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedCustomizations, setSelectedCustomizations] = useState({});

  const handleCustomizationChange = (group, option) => {
    setSelectedCustomizations((prev) => {
      if (group.selectionType === "SINGLE") {
        return { ...prev, [group.id]: [option] };
      } else {
        const existing = prev[group.id] || [];
        const exists = existing.find((o) => o.id === option.id);

        if (exists) {
          return {
            ...prev,
            [group.id]: existing.filter((o) => o.id !== option.id)
          };
        } else {
          return {
            ...prev,
            [group.id]: [...existing, option]
          };
        }
      }
    });
  };

  const handleAddItem = () => {
  if (!selectedVariant) {
    toast.warning("Please select a variant");
    return;
  }

  // Convert Addons → backend-required format
  const formattedAddons = selectedAddons.map(a => ({
    addonId: a.id,
    additionalCharge: a.price
  }));

  // Convert Customizations → backend-required format
  const formattedCustomizations = Object
    .values(selectedCustomizations)
    .flat()
    .map(c => ({
      customizationOptionId: c.id,
      customizationOptionName: c.optionName,
      additionalCharge: c.additionalPrice
    }));

  onAddToCart({
    selectedVariant,
    addons: formattedAddons,
    customizations: formattedCustomizations,
  });

  onClose();
};

  return (
    <>
      {/* BACKDROP */}
      <div className="waiter-menuitempop-drawer-backdrop" onClick={onClose}></div>

      {/* RIGHT SLIDING DRAWER */}
      <div className="waiter-menuitempop-drawer">
        <div className="waiter-menuitempop-drawer-header">
          <h2>{item.itemName}</h2>
          <button onClick={onClose}>✖</button>
        </div>

        <div className="waiter-menuitempop-drawer-content">
          {/* VARIANTS */}
          {item.variants?.length > 0 && (
            <div className="waiter-menuitempop-drawer-section">
              <h4>Select Variant</h4>
              {item.variants.map((v) => (
                <label key={v.id} className="waiter-menuitempop-drawer-option">
                  <input
                    type="radio"
                    name="variant"
                    checked={selectedVariant?.id === v.id}
                    onChange={() => setSelectedVariant(v)}
                  />
                  <span>{v.variantName} – ₹{v.price}</span>
                </label>
              ))}
            </div>
          )}

          {/* ADDONS */}
          {item.availableAddons?.length > 0 && (
            <div className="waiter-menuitempop-drawer-section">
              <h4>Add-ons</h4>
              {item.availableAddons.map((a) => (
                <label key={a.id} className="waiter-menuitempop-drawer-option">
                  <input
                    type="checkbox"
                    checked={selectedAddons.some((ad) => ad.id === a.id)}
                    onChange={() =>
                      setSelectedAddons((prev) =>
                        prev.some((x) => x.id === a.id)
                          ? prev.filter((x) => x.id !== a.id)
                          : [...prev, a]
                      )
                    }
                  />
                  <span>{a.name} – ₹{a.price}</span>
                </label>
              ))}
            </div>
          )}

          {/* CUSTOMIZATIONS */}
          {item.customizationGroups?.length > 0 && (
            <div className="waiter-menuitempop-drawer-section">
              <h4>Customizations</h4>
              {item.customizationGroups.map((group) => (
                <div key={group.id} className="waiter-menuitempop-drawer-custom-group">
                  <h5>{group.name} {group.isRequired ? "(Required)" : ""}</h5>
                  {group.options.map((opt) => (
                    <label key={opt.id} className="waiter-menuitempop-drawer-option">
                      <input
                        type={group.selectionType === "SINGLE" ? "radio" : "checkbox"}
                        name={`custom-${group.id}`}
                        checked={
                          selectedCustomizations[group.id]?.some(
                            (o) => o.id === opt.id
                          ) || false
                        }
                        onChange={() => handleCustomizationChange(group, opt)}
                      />
                      <span>{opt.optionName} – ₹{opt.additionalPrice}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="waiter-menuitempop-drawer-actions">
          <button className="waiter-menuitempop-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="waiter-menuitempop-add-btn" disabled={!selectedVariant} onClick={handleAddItem}>Add Item</button>
        </div>
      </div>
    </>
  );
}
