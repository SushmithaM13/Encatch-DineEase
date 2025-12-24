// src/pages/AdminMenu/AdminMenuDetails.jsx

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMenuById, deleteMenu } from "./Api/menuApi";
import "./SuperAdminMenuDetails.css";   // <-- Add CSS later

export default function SuperAdminMenuDetails() {
  const { menuId } = useParams();                 // FIX: param name must match route
  const navigate = useNavigate();

  const location = useLocation();
  const passedMenu = location.state?.menu || null;

  const [menu, setMenu] = useState(passedMenu);
  const [loading, setLoading] = useState(!passedMenu);

  // Load menu only when not passed from previous screen
  useEffect(() => {
    async function load() {
      if (!menu) {
        try {
          const data = await getMenuById(menuId);
          setMenu(data);
        } catch (err) {
          alert("Failed to load menu details");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    }
    load();
  }, [menuId]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this menu?")) return;

    try {
      await deleteMenu(menuId);
      alert("Menu deleted successfully");
      navigate("/SuperAdminDashboard/menu");
    } catch (err) {
      alert("Failed to delete");
      console.error(err);
    }
  };

  if (loading || !menu) return <p>Loading...</p>;

  return (
    <div className="Superadmin-menu-details-container">
      {/* Back Button */}
      <button className="Superadmin-menu-details-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Header */}
      <div className="Superadmin-menu-details-header">
        <h2>{menu.itemName}</h2>

        <div className="Superadmin-menu-details-actions">
          <button
            className="Superadmin-menu-details-edit-btn"
            onClick={() =>
              navigate(`/SuperAdminDashboard/menu/edit/${menu.id}`, {
                state: { menu },
              })

            }
          >
            ✏ Edit
          </button>

          <button className="Superadmin-menu-details-delete-btn" onClick={handleDelete}>🗑 Delete</button>
        </div>
      </div>

      {/* Content Section */}
      <div className="Superadmin-menu-details-details-content">

        {/* LEFT: IMAGE */}
        <div className="Superadmin-menu-details-menu-image-block">
          <img
            src={
              menu.imageData
                ? `data:image/jpeg;base64,${menu.imageData}`
                : "/default-menu.png"
            }
            alt={menu.itemName}
            className="Superadmin-menu-details-menu-large-img"
          />
        </div>

        {/* RIGHT: DETAILS */}
        <div className="Superadmin-menu-details-menu-info">
          <p><b>Category:</b> {menu.categoryName}</p>
          <p><b>Item Type:</b> {menu.itemTypeName}</p>
          <p><b>Food Type:</b> {menu.foodTypeName}</p>
          <p><b>Cuisine:</b> {menu.cuisineTypeName}</p>
          <p><b>Available:</b> {menu.isAvailable ? "Yes" : "No"}</p>
          <p><b>Chef Special:</b> {menu.chefSpecial ? "Yes" : "No"}</p>
          <p><b>Spice Level:</b> {menu.spiceLevel}</p>
          <p><b>Preparation Time:</b> {menu.preparationTime} mins</p>
          <p><b>Allergen Info:</b> {menu.allergenInfo || "None"}</p>

          <hr />

          <h3>Description</h3>
          <p>{menu.description || "No Description"}</p>

          <hr />

          {/* VARIANTS */}
          <h3>Variants</h3>
          {menu.variants?.length ? (
            <ul>
              {menu.variants.map((v, i) => (
                <li key={i}>
                  <b>{v.variantName}</b>
                  — {v.variantType} | {v.quantityUnit}
                  | ₹{v.price}
                  {v.discountPrice > 0 && ` (Discount: ₹${v.discountPrice})`}
                </li>
              ))}
            </ul>
          ) : (
            <p>No variants added</p>
          )}

          <hr />

          {/* ADDONS */}
          <h3>Addons</h3>
          {menu.addons?.length ? (
            <ul>
              {menu.addons.map((a, i) => (
                <li key={i}>
                  <b>{a.addonName}</b> — Max Qty: {a.maxQuantity}
                </li>
              ))}
            </ul>
          ) : (
            <p>No addons added</p>
          )}

          <hr />

          {/* CUSTOMIZATION GROUPS */}
          <h3>Customization Groups</h3>
          {menu.customizationGroups?.length ? (
            <ul>
              {menu.customizationGroups.map((cg, i) => (
                <li key={i}>{cg.groupName}</li>
              ))}
            </ul>
          ) : (
            <p>No customization groups</p>
          )}
        </div>
      </div>
    </div>
  );
}
