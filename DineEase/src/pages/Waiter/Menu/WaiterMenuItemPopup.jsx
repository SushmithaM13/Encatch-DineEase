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

    // Send to Dashboard cart
    onAddToCart({
  selectedVariant, 
  addons: selectedAddons,
  customizations: Object.values(selectedCustomizations).flat(),
});


    // toast.success("Item added to cart!");
    onClose();
  };

  return (
    <>
      {/* BACKDROP */}
      <div className="waiter-drawer-backdrop" onClick={onClose}></div>

      {/* RIGHT SLIDING DRAWER */}
      <div className="waiter-drawer">
        <div className="waiter-drawer-header">
          <h2>{item.itemName}</h2>
          <button onClick={onClose}>✖</button>
        </div>

        <div className="waiter-drawer-content">
          {/* VARIANTS */}
          {item.variants?.length > 0 && (
            <div className="drawer-section">
              <h4>Select Variant</h4>
              {item.variants.map((v) => (
                <label key={v.id} className="drawer-option">
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
            <div className="drawer-section">
              <h4>Add-ons</h4>
              {item.availableAddons.map((a) => (
                <label key={a.id} className="drawer-option">
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
            <div className="drawer-section">
              <h4>Customizations</h4>
              {item.customizationGroups.map((group) => (
                <div key={group.id} className="drawer-custom-group">
                  <h5>{group.name} {group.isRequired ? "(Required)" : ""}</h5>
                  {group.options.map((opt) => (
                    <label key={opt.id} className="drawer-option">
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
        <div className="drawer-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="add-btn" disabled={!selectedVariant} onClick={handleAddItem}>Add Item</button>
        </div>
      </div>
    </>
  );
}
