import React, { useEffect } from "react";
import AdminVariantRow from "./SuperAdminVariantRow";
import { toast } from "react-toastify";
import { fetchDropdowns, updateMenu } from "./menuApi"; // <-- import updateMenu
import "./EditMenuModal.css";

export default function EditMenuModal({
    open,
    onClose,
    newMenu,
    setNewMenu,
    // onSave, <-- remove unused prop
    categories = [],
    itemTypes = [],
    foodTypes = [],
    cuisines = [],
    addons = [],
    customizeGroups = [],
    setCategories,
    setItemTypes,
    setFoodTypes,
    setCuisines,
    setAddons,
    setCustomizeGroups,
    organizationId,
    fetchMenus
}) {

    useEffect(() => {
        if (!organizationId) return;

        fetchDropdowns(organizationId)
            .then((data) => {
                setCategories(Array.isArray(data.categories) ? data.categories : data.categories?.content || []);
                setItemTypes(Array.isArray(data.itemTypes) ? data.itemTypes : data.itemTypes?.content || []);
                setFoodTypes(Array.isArray(data.foodTypes) ? data.foodTypes : data.foodTypes?.content || []);
                setCuisines(Array.isArray(data.cuisines) ? data.cuisines : data.cuisines?.content || []);
                setAddons(Array.isArray(data.addons) ? data.addons : data.addons?.content || []);
                setCustomizeGroups(Array.isArray(data.groups) ? data.groups : data.groups?.content || []);
            })
            .catch(() => toast.error("Failed to load dropdowns"));

        fetchMenus();
    }, [organizationId]);

    if (!open || !newMenu) return null;

    // VARIANT HANDLERS
    const updateVariant = (index, key, value) => {
        const updated = [...newMenu.variants];
        updated[index] = { ...updated[index], [key]: value };
        setNewMenu({ ...newMenu, variants: updated });
    };

    const addVariant = () => {
        setNewMenu({
            ...newMenu,
            variants: [
                ...newMenu.variants,
                {
                    id: undefined,
                    variantName: "",
                    variantType: "",
                    quantityUnit: "",
                    price: 0,
                    discountPrice: 0,
                    displayOrder: 0,
                    isDefault: false,
                    isAvailable: true
                }
            ]
        });
    };

    const removeVariant = (index) => {
        setNewMenu({
            ...newMenu,
            variants: newMenu.variants.filter((_, i) => i !== index)
        });
    };

    // IMAGE HANDLER
    const handleImage = (file) => {
        setNewMenu({
            ...newMenu,
            imageFile: file,
            imagePreview: file ? URL.createObjectURL(file) : null
        });
    };

    // SAVE HANDLER
    const handleSave = async () => {
        try {
            if (!newMenu) return;

            const formData = new FormData();

            // BASIC FIELDS
            formData.append("itemName", newMenu.itemName || "");
            formData.append("description", newMenu.description || "");
            formData.append("categoryId", String(newMenu.categoryId || ""));
            formData.append("itemTypeId", String(newMenu.itemTypeId || ""));
            formData.append("foodTypeId", String(newMenu.foodTypeId || ""));
            formData.append("cuisineTypeId", String(newMenu.cuisineTypeId || ""));
            formData.append("spiceLevel", String(newMenu.spiceLevel || 1));
            formData.append("preparationTime", String(newMenu.preparationTime || 0));
            formData.append("allergenInfo", newMenu.allergenInfo || "");

            // FLAGS
            formData.append("isAvailable", newMenu.isAvailable ? "true" : "false");
            formData.append("isRecommended", newMenu.isRecommended ? "true" : "false");
            formData.append("isBestseller", newMenu.isBestseller ? "true" : "false");
            formData.append("chefSpecial", newMenu.chefSpecial ? "true" : "false");

            // IMAGE
            if (newMenu.imageFile) formData.append("imageFile", newMenu.imageFile);

            // ARRAYS
            formData.append("variants", JSON.stringify(newMenu.variants || []));
            formData.append("selectedAddons", JSON.stringify(newMenu.selectedAddons?.map(a => a.id) || []));
            formData.append("customizationGroupIds", JSON.stringify(newMenu.customizationGroupIds || []));

            // CALL API
            await updateMenu(newMenu.id, formData);

            toast.success("Menu updated successfully");
            onClose();
            fetchMenus();
        } catch (err) {
            console.error("Failed to save menu:", err);
            toast.error(err.message || "Failed to save menu");
        }
    };


    // ---------------------------------------------------
    // UI
    // ---------------------------------------------------
    return (
        <div className="Super-admin-menuedit-modal-overlay">
            <div className="Super-admin-menuedit-modal-box">

                <h2>Edit Menu Item</h2>

                {/* BASIC DETAILS */}
                <div className="Super-admin-menuedit-section">
                    <label>Item Name</label>
                    <input
                        type="text"
                        value={newMenu.itemName}
                        onChange={(e) => setNewMenu({ ...newMenu, itemName: e.target.value })}
                    />

                    <label>Description</label>
                    <textarea
                        value={newMenu.description}
                        onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
                    />

                    {/* CATEGORY */}
                    <label>Category</label>
                    <select
                        value={newMenu.categoryId || ""}
                        onChange={(e) => {
                            const id = Number(e.target.value);
                            const selected = categories.find((c) => c.id === id);
                            setNewMenu({
                                ...newMenu,
                                categoryId: id,
                                categoryName: selected?.categoryName
                            });
                        }}
                    >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.categoryName}</option>
                        ))}
                    </select>

                    {/* ROW OF DROPDOWNS */}
                    <div className="Super-admin-menuedit-row-3">

                        {/* ITEM TYPE */}
                        <div>
                            <label>Item Type</label>
                            <select
                                value={newMenu.itemTypeId || ""}
                                onChange={(e) => {
                                    const id = Number(e.target.value);
                                    const selected = itemTypes.find((x) => x.id === id);
                                    setNewMenu({
                                        ...newMenu,
                                        itemTypeId: id,
                                        itemTypeName: selected?.itemTypeName || selected?.name
                                    });
                                }}
                            >
                                <option value="">Select Type</option>
                                {itemTypes.map((x) => (
                                    <option key={x.id} value={x.id}>{x.itemTypeName || x.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* FOOD TYPE */}
                        <div>
                            <label>Food Type</label>
                            <select
                                value={newMenu.foodTypeId || ""}
                                onChange={(e) => {
                                    const id = Number(e.target.value);
                                    const selected = foodTypes.find((x) => x.id === id);
                                    setNewMenu({
                                        ...newMenu,
                                        foodTypeId: id,
                                        foodTypeName: selected?.foodTypeName || selected?.name
                                    });
                                }}
                            >
                                <option value="">Select Food Type</option>
                                {foodTypes.map((x) => (
                                    <option key={x.id} value={x.id}>{x.foodTypeName || x.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* CUISINE */}
                        <div>
                            <label>Cuisine</label>
                            <select
                                value={newMenu.cuisineTypeId || ""}
                                onChange={(e) => {
                                    const id = Number(e.target.value);
                                    const selected = cuisines.find((x) => x.id === id);
                                    setNewMenu({
                                        ...newMenu,
                                        cuisineTypeId: id,
                                        cuisineTypeName: selected?.cuisineTypeName || selected?.name
                                    });
                                }}
                            >
                                <option value="">Select Cuisine</option>
                                {cuisines.map((x) => (
                                    <option key={x.id} value={x.id}>{x.cuisineTypeName || x.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* REST OF BASIC FIELDS */}
                    <label>Spice Level (1–5)</label>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={newMenu.spiceLevel}
                        onChange={(e) => setNewMenu({ ...newMenu, spiceLevel: Number(e.target.value) })}
                    />

                    <label>Preparation Time</label>
                    <input
                        type="number"
                        value={newMenu.preparationTime}
                        onChange={(e) => setNewMenu({ ...newMenu, preparationTime: Number(e.target.value) })}
                    />

                    <label>Allergen Info</label>
                    <input
                        type="text"
                        value={newMenu.allergenInfo || ""}
                        onChange={(e) => setNewMenu({ ...newMenu, allergenInfo: e.target.value })}
                    />

                    {/* FLAGS */}
                    <div className="Super-admin-menuedit-flags-row">
                        {[
                            ["isAvailable", "Available"],
                            ["isRecommended", "Recommended"],
                            ["isBestseller", "Bestseller"],
                            ["chefSpecial", "Chef's Special"]
                        ].map(([key, label]) => (
                            <label key={key}>
                                <input
                                    type="checkbox"
                                    checked={!!newMenu[key]}
                                    onChange={(e) => setNewMenu({ ...newMenu, [key]: e.target.checked })}
                                />{" "}
                                {label}
                            </label>
                        ))}
                    </div>

                    {/* IMAGE */}
                    <label>Upload Image</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImage(e.target.files?.[0] || null)} />

                    {newMenu.imagePreview && (
                        <img src={newMenu.imagePreview} alt="preview" className="Super-admin-menuedit-image-preview" />
                    )}
                </div>

                {/* VARIANTS */}
                <div className="Super-admin-menuedit-section">
                    <h3>Variants</h3>

                    <button type="button" onClick={addVariant}>+ Add Variant</button>

                    <table className="Super-admin-menuedit-variant-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Discount</th>
                                <th>Final</th>
                                <th>Order</th>
                                <th>Default</th>
                                <th>Available</th>
                                <th>Delete</th>
                            </tr>
                        </thead>

                        {/* VARIANTS */}
                        <tbody>
                            {newMenu.variants.map((v) => (
                                <AdminVariantRow
                                    key={v.variantId || v.id || Math.random()} // use unique id if available
                                    v={v}
                                    onChange={updateVariant}
                                    onRemove={removeVariant}
                                />
                            ))}
                        </tbody>

                    </table>
                </div>

                {/* ADDONS */}
                <div className="Super-admin-menuedit-addons-container">
                    {addons.length === 0 && <p>No addons available</p>}

                    {addons.map((a) => {
                        const checked = (newMenu.selectedAddons || []).some(x => x.id === a.id);

                        return (
                            <label key={a.id || a.addOnId || Math.random()} className="Super-admin-menuedit-addon-box">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                        let list = [...(newMenu.selectedAddons || [])];
                                        if (e.target.checked) list.push(a);
                                        else list = list.filter(x => x.id !== a.id);

                                        setNewMenu({ ...newMenu, selectedAddons: list });
                                    }}
                                />
                                {a.addOnName || a.name} — ₹{a.additionalPrice}
                            </label>
                        );
                    })}
                </div>

                {/* CUSTOMIZATION GROUPS */}
                <div className="Super-admin-menuedit-customize-group-box">
                    {customizeGroups.length === 0 && <p>No groups available</p>}

                    {customizeGroups.map((g) => {
                        const checked = (newMenu.customizationGroupIds || []).includes(g.id);

                        return (
                            <label key={g.id || g.groupId || Math.random()} className="Super-admin-menuedit-group-box">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                        let list = [...(newMenu.customizationGroupIds || [])];
                                        if (e.target.checked) list.push(g.id);
                                        else list = list.filter(x => x !== g.id);

                                        setNewMenu({ ...newMenu, customizationGroupIds: list });
                                    }}
                                />
                                {g.groupName || g.name}
                            </label>
                        );
                    })}
                </div>


                {/* ACTIONS */}
                <div className="Super-admin-menuedit-modal-actions">
                    <button className="Super-admin-menuedit-save-btn" onClick={handleSave}>Save</button>
                    <button className="Super-admin-menuedit-close-btn" onClick={onClose}>Cancel</button>
                </div>

            </div>
        </div>
    );
}
