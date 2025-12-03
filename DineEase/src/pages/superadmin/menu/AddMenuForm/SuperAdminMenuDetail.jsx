/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchMenuById,
  updateMenu,
  deleteMenu,
} from "./menuApi";
import EditMenuModal from "./EditMenuModal";
import "./SuperAdminMenuDetail.css";

// ✅ ADD BASE_URL HERE
const BASE_URL = "http://localhost:8082/dine-ease";

export default function SuperAdminMenuDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [newMenu, setNewMenu] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  const organizationId = localStorage.getItem("organizationId");
  const token = localStorage.getItem("token");

  // Dropdown data
  const [categories, setCategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [addons, setAddons] = useState([]);
  const [customizeGroups, setCustomizeGroups] = useState([]);

  // ------------------------ NEW FETCH API FUNCTIONS ------------------------

  const fetchCategories = async () => {
    const res = await fetch(
      `${BASE_URL}/menu-category/${organizationId}/all`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.json();
  };

  const fetchItemTypes = async () => {
    const res = await fetch(
      `${BASE_URL}/menu/item-types/${organizationId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.json();
  };

  const fetchFoodTypes = async () => {
    const res = await fetch(
      `${BASE_URL}/menu/food-types/${organizationId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.json();
  };

  const fetchCuisineTypes = async () => {
    const res = await fetch(
      `${BASE_URL}/menu/cuisine-types/${organizationId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.json();
  };

  const fetchAddonsData = async () => {
    const res = await fetch(
      `${BASE_URL}/menu/addons/${organizationId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.json();
  };

  const fetchCustomizationGroups = async () => {
    const res = await fetch(
      `${BASE_URL}/menu/customization-groups/${organizationId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.json();
  };

  // -------------------------------------------------------------------------

  const fetchMenus = async () => {
    if (!id) return;
    const data = await fetchMenuById(id, token);
    setMenu(data);
    setNewMenu({
      ...newMenu,
      ...data,
    });
  };

  // Load menu and dropdown data
  useEffect(() => {
    const loadMenu = async () => {
      if (!id) return;
      try {
        const data = await fetchMenuById(id, token);
        setMenu(data);

        setNewMenu({
          id: data.id,
          menuItemId: data.id,
          itemName: data.itemName || data.menuName || "",
          description: data.description || "",
          categoryName: data.categoryName || "",
          itemTypeName: data.itemTypeName || "",
          foodTypeName: data.foodTypeName || "",
          cuisineTypeName: data.cuisineTypeName || "",
          spiceLevel: data.spiceLevel ?? 1,
          isAvailable: data.isAvailable ?? true,
          isRecommended: data.isRecommended ?? false,
          isBestseller: data.isBestseller ?? false,
          chefSpecial: data.chefSpecial ?? false,
          preparationTime: data.preparationTime ?? 1,
          allergenInfo: data.allergenInfo || "",
          variants: (data.variants || []).map((v) => ({
            id: v.id,
            variantId: v.id,
            variantName: v.variantName,
            variantType: v.variantType,
            price: v.price ?? 0,
            discountPrice: v.discountPrice ?? 0,
            isDefault: v.isDefault ?? false,
            isAvailable: v.isAvailable ?? true,
            displayOrder: v.displayOrder ?? 0,
            quantityUnit: v.quantityUnit || "",
          })),
          availableAddons: data.availableAddons || [],
          customizationGroups: data.customizationGroups || [],
          customizationGroupNames: (data.customizationGroups || []).map(
            (g) => g.name
          ),
          imagePreview: data.imageData
            ? `data:image/jpeg;base64,${data.imageData}`
            : data.imageUrl
            ? data.imageUrl.replace(
                "C:\\dine-ease-backend\\dine-ease\\uploads\\",
                "http://localhost:8082/dine-ease/uploads/"
              )
            : null,
          imageFile: null,
        });

        // Load dropdown data
        fetchCategories();
        fetchItemTypes();
        fetchFoodTypes();
        fetchCuisineTypes();
        fetchAddonsData();
        fetchCustomizationGroups();
      } catch {
        toast.error("Failed to load menu details");
      }
    };

    loadMenu();
  }, [id]);

  // ------------------------ SAVE -----------------------------------

  const handleSave = async () => {
    try {
      const form = new FormData();
      form.append("organizationId", organizationId);
      form.append("menuItemId", newMenu.menuItemId);

      form.append("categoryName", newMenu.categoryName);
      form.append("itemName", newMenu.itemName);
      form.append("description", newMenu.description);

      if (newMenu.imageFile) {
        form.append("image", newMenu.imageFile);
      }

      form.append("itemTypeName", newMenu.itemTypeName);
      form.append("foodTypeName", newMenu.foodTypeName);
      form.append("cuisineTypeName", newMenu.cuisineTypeName);
      form.append("spiceLevel", newMenu.spiceLevel);
      form.append("isAvailable", newMenu.isAvailable);
      form.append("isRecommended", newMenu.isRecommended);
      form.append("isBestseller", newMenu.isBestseller);
      form.append("chefSpecial", newMenu.chefSpecial);
      form.append("preparationTime", newMenu.preparationTime);
      form.append("allergenInfo", newMenu.allergenInfo);

      newMenu.variants.forEach((v, i) => {
        form.append(`variants[${i}].variantId`, v.variantId || v.id);
        form.append(`variants[${i}].variantName`, v.variantName);
        form.append(`variants[${i}].variantType`, v.variantType);
        form.append(`variants[${i}].price`, v.price);
        form.append(`variants[${i}].discountPrice`, v.discountPrice);
        form.append(`variants[${i}].isDefault`, v.isDefault);
        form.append(`variants[${i}].isAvailable`, v.isAvailable);
        form.append(`variants[${i}].displayOrder`, v.displayOrder);
        form.append(`variants[${i}].quantityUnit`, v.quantityUnit);
      });

      newMenu.customizationGroupNames.forEach((g, i) => {
        form.append(`customizationGroupNames[${i}]`, g);
      });

      await updateMenu(newMenu.id, form, token);
      toast.success("Menu updated successfully!");
      setOpenEdit(false);

      const refreshed = await fetchMenuById(newMenu.id, token);
      setMenu(refreshed);
      setNewMenu({ ...newMenu, ...refreshed });
    } catch {
      toast.error("Update failed");
    }
  };

  // ------------------------ DELETE -----------------------------------

  const handleDelete = async () => {
    if (!window.confirm("Delete this menu?")) return;
    try {
      await deleteMenu(id);
      toast.success("Menu deleted");
      navigate("/SuperAdminDashboard/menu");
    } catch {
      toast.error("Failed to delete menu");
    }
  };

  if (!menu || !newMenu) return <p>Loading...</p>;

  return (
    <div className="Super-admin-menudetail-container">
      <h1 className="Super-admin-menudetail-title">{menu.itemName}</h1>

      {menu.imageData || menu.imageUrl ? (
        <img
          className="Super-admin-menudetail-image"
          src={
            menu.imageData
              ? `data:image/jpeg;base64,${menu.imageData}`
              : menu.imageUrl.replace(
                  "C:\\dine-ease-backend\\dine-ease\\uploads\\",
                  "http://localhost:8082/dine-ease/uploads/"
                )
          }
          alt="Menu Item"
        />
      ) : (
        <p>No image</p>
      )}

      <p className="Super-admin-menudetail-description">{menu.description}</p>

      <div className="Super-admin-menudetail-actions">
        <button
          className="Super-admin-menudetail-btn"
          onClick={() => setOpenEdit(true)}
        >
          Edit
        </button>

        <button
          className="Super-admin-menudetail-btn admin-menudetail-btn-delete"
          onClick={handleDelete}
        >
          Delete
        </button>

        <button
          className="Super-admin-menudetail-btn admin-menudetail-btn-back"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      {/* Variants */}
      <section className="Super-admin-menudetail-section">
        <h3>Variants</h3>
        <table className="Super-admin-menudetail-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            {menu.variants?.map((v) => (
              <tr key={v.id}>
                <td>{v.variantName}</td>
                <td>{v.variantType}</td>
                <td>{v.quantityUnit || "-"}</td>
                <td>₹{v.price}</td>
                <td>{v.discountPrice ? `₹${v.discountPrice}` : "-"}</td>
                <td>{v.isAvailable ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Addons */}
      <section className="Super-admin-menudetail-section">
        <h3>Addons</h3>
        <ul className="Super-admin-menudetail-list">
          {menu.availableAddons?.map((addon) => (
            <li key={addon.id}>
              <strong>{addon.name}</strong> – ₹{addon.price}
            </li>
          ))}
        </ul>
      </section>

      {/* Customization Groups */}
      <section className="Super-admin-menudetail-section">
        <h3>Customization Groups</h3>
        <ul className="Super-admin-menudetail-list">
          {menu.customizationGroups?.map((g) => (
            <li key={g.id}>
              <strong>{g.name}</strong> {g.isRequired ? "(Required)" : ""}
              <ul className="Super-admin-menudetail-sublist">
                {g.options?.map((o) => (
                  <li key={o.id}>
                    {o.optionName} – ₹{o.additionalPrice}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* Edit Modal */}
      <EditMenuModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        newMenu={newMenu}
        setNewMenu={setNewMenu}
        onSave={handleSave}
        organizationId={organizationId}
        categories={categories}
        itemTypes={itemTypes}
        foodTypes={foodTypes}
        cuisines={cuisines}
        addons={addons}
        customizeGroups={customizeGroups}
        setCategories={setCategories}
        setItemTypes={setItemTypes}
        setFoodTypes={setFoodTypes}
        setCuisines={setCuisines}
        setAddons={setAddons}
        setCustomizeGroups={setCustomizeGroups}
        fetchMenus={fetchMenus}
      />
    </div>
  );
}
