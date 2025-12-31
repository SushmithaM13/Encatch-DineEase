import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Edit3, Trash2 } from "lucide-react";
import { getMenuById, deleteMenu } from "./Api/menuApi";
import "./AdminMenuDetails.css";

// Transform backend response to match component's expected structure
function transformMenuResponse(menu) {
  return {
    ...menu,
    // Map addons
    addons: menu.availableAddons?.map(a => ({
      ...a,
      addonName: a.name,
    })) || [],

    // Map customization groups
    customizationGroups: menu.customizationGroups?.map(cg => ({
      ...cg,
      groupName: cg.name,
      options: cg.options?.map(op => ({
        ...op,
        optionName: op.optionName || op.name,
      })) || [],
    })) || [],

    // Map basic info for compatibility
    category: { categoryName: menu.categoryName },
    itemType: { itemTypeName: menu.itemType },
    foodType: { foodTypeName: menu.foodType },
    cuisine: { cuisineTypeName: menu.cuisineType },
  };
}

export default function AdminMenuDetails() {
  const { menuId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedMenu = location.state?.menu || null;

  const [menu, setMenu] = useState(passedMenu ? transformMenuResponse(passedMenu) : null);
  const [loading, setLoading] = useState(!passedMenu);

  // Load menu only if not passed
  useEffect(() => {
    async function load() {
      if (!menu) {
        try {
          const data = await getMenuById(menuId);
          setMenu(transformMenuResponse(data));
        } catch (err) {
          alert("Failed to load menu details");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    }
    load();
  }, [menuId, menu]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this menu?")) return;
    try {
      await deleteMenu(menuId);
      alert("Menu deleted successfully");
      navigate("/AdminDashboard/menu");
    } catch (err) {
      alert("Failed to delete");
      console.error(err);
    }
  };

  if (loading || !menu) return <p>Loading...</p>;

  return (
    <div className="admin-menu-details-container">
      {/* HEADER */}
      <div className="admin-menu-details-top">
        <button className="admin-menu-details-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2 className="menu-title">{menu.itemName}</h2>
      </div>

      <div className="admin-menu-details-details-card">

        {/* LEFT PANEL - IMAGE */}
        <div className="admin-menu-details-left-panel">
          <div className="admin-menu-details-image-wrapper">
            <img
              src={
                menu.imageData
                  ? `data:image/jpeg;base64,${menu.imageData}`
                  : menu.imageUrl || "/default-menu.png"
              }
              alt={menu.itemName}
            />
            {/* EDIT / DELETE */}
            <div className="admin-menu-details-action-buttons">
              <button
                className="admin-menu-details-edit-btn"
                onClick={() =>
                  console.log("Edit", menu) ||
                  navigate(`/AdminDashboard/menu/edit/${menu.id}`, { state: { menu } })
                }
              >
                <Edit3 size={16} />
              </button>
              <button className="admin-menu-details-delete-btn" onClick={handleDelete}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - DETAILS */}
        <div className="admin-menu-details-right-panel">

          {/* BASIC INFO */}
          <div className="admin-menu-details-details-section">
            <h3>Basic Information</h3>
            <div className="admin-menu-details-info-grid">
              <p><b>Category:</b> {menu.category?.categoryName}</p>
              <p><b>Item Type:</b> {menu.itemType?.itemTypeName}</p>
              <p><b>Food Type:</b> {menu.foodType?.foodTypeName}</p>
              <p><b>Cuisine:</b> {menu.cuisine?.cuisineTypeName}</p>
              <p><b>Spice Level:</b> {menu.spiceLevel || "N/A"}</p>
              <p><b>Preparation Time:</b> {menu.preparationTime || "N/A"} mins</p>
              <p><b>Available:</b> {menu.isAvailable ? "Yes" : "No"}</p>
              <p><b>Recommended:</b> {menu.isRecommended ? "Yes" : "No"}</p>
              <p><b>Bestseller:</b> {menu.isBestseller ? "Yes" : "No"}</p>
              <p><b>Chef Special:</b> {menu.chefSpecial ? "Yes" : "No"}</p>
              <p><b>Allergen Info:</b> {menu.allergenInfo || "None"}</p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="admin-menu-details-details-section">
            <h3>Description</h3>
            <p>{menu.description || "No Description available"}</p>
          </div>

          {/* VARIANTS */}
          <div className="admin-menu-details-details-section">
            <h3>Variants</h3>
            {menu.variants?.length ? (
              <ul className="admin-menu-details-list-block">
                {menu.variants.map((v, i) => (
                  <li key={i} className="admin-menu-details-variant-card">
                    <p><b>{v.variantName}</b></p>
                    <p>Type: {v.variantType || "N/A"}</p>
                    <p>Quantity: {v.quantityUnit || "N/A"}</p>
                    <p>Price: ₹{v.price ?? 0}</p>
                    {v.discountPrice ? <p>Discount: {v.discountPrice}%</p> : null}
                    <p>Final Price: ₹{v.finalPrice ?? v.price ?? 0}</p>
                    <p>Default: {v.isDefault ? "Yes" : "No"}</p>
                    <p>Available: {v.isAvailable ? "Yes" : "No"}</p>
                    <p>Display Order: {v.displayOrder ?? 0}</p>

                  </li>
                ))}
              </ul>
            ) : (
              <p>No variants added</p>
            )}
          </div>

          {/* ADDONS */}
          <div className="admin-menu-details-details-section">
            <h3>Addons</h3>
            {menu.addons?.length ? (
              <ul className="admin-menu-details-list-block">
                {menu.addons.map((a, i) => (
                  <li key={i}>
                    <b>{a.addonName}</b> — Max Qty: {a.maxQuantity ?? 1} — Default: {a.isDefault ? "Yes" : "No"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No addons</p>
            )}
          </div>

          {/* CUSTOMIZATION GROUPS */}
          <div className="admin-menu-details-details-section">
            <h3>Customization Groups</h3>
            {menu.customizationGroups?.length ? (
              <ul className="admin-menu-details-list-block">
                {menu.customizationGroups.map((cg, i) => (
                  <li key={i}>
                    <b>{cg.groupName}</b>
                    <ul className="admin-menu-details-nested-list">
                      {cg.options?.map((op, idx) => (
                        <li key={idx}>
                          {op.optionName} (+₹{op.additionalPrice ?? 0})
                          {op.isDefault && " ⭐ Default"}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No customization groups</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
