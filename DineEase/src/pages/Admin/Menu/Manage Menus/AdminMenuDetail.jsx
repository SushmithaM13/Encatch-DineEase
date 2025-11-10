import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import "./AdminMenuDetail.css";

export default function AdminMenuDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [menu, setMenu] = useState(null);
  const [categories, setCategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [organizationId, setOrganizationId] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:8082/dine-ease/api/v1/menu";
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";

  // ---------- Safe JSON Fetch ----------
  const fetchJson = async (url) => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        console.error(`Request failed: ${url} status=${res.status}`);
        return [];
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      return [];
    }
  };

  // ---------- Fetch Profile ----------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("Unauthorized: Please log in!");
        const res = await fetch(PROFILE_API, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setOrganizationId(data.organizationId || data.organization?.id || "");
      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  // ---------- Fetch Categories / Types / Cuisines ----------
  useEffect(() => {
    const fetchTypes = async () => {
      setCategories(await fetchJson(`${API_BASE}/categories`) || []);
      setItemTypes(await fetchJson(`${API_BASE}/item-types`) || []);
      setFoodTypes(await fetchJson(`${API_BASE}/food-types`) || []);
      setCuisines(await fetchJson(`${API_BASE}/cuisines`) || []);
    };
    fetchTypes();
  }, []);

  // ---------- Fetch Menu + Suggested ----------
  useEffect(() => {
    if (!organizationId) return;

    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch menu details");
        const data = await res.json();
        setMenu(data);

        if (data.itemName) fetchSuggested(data.itemName, token);
      } catch (err) {
        console.error("Menu fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSuggested = async (itemName, token) => {
      try {
        const res = await fetch(`${API_BASE}/organization/${organizationId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          console.error("Failed to fetch suggested items:", res.status);
          setSuggested([]);
          return;
        }
        const allMenus = await res.json();
        const keyword = itemName.toLowerCase().split(" ")[0];
        const related = allMenus.filter((m) => m.id !== Number(id) && m.itemName?.toLowerCase().includes(keyword));
        setSuggested(related);
      } catch (err) {
        console.error("Failed to load suggested items:", err);
        setSuggested([]);
      }
    };

    fetchMenu();
  }, [organizationId, id]);

  // ---------- Fetch Recommended Items ----------
  useEffect(() => {
    if (!organizationId) return;
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/organization/${organizationId}/recommended`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        return res.json();
      })
      .then((data) => Array.isArray(data) && setRecommendedItems(data))
      .catch((err) => {
        console.error("Error fetching recommended items:", err);
        setRecommendedItems([]);
      });
  }, [organizationId]);

  // ---------- Handle Update ----------
  const handleUpdate = async () => {
    if (!window.confirm("Do you want to update this menu item?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Unauthorized");

      const form = new FormData();
      form.append("organizationId", organizationId);
      form.append("itemName", menu.itemName || "");
      form.append("description", menu.description || "");
      if (menu.imageFile) form.append("image", menu.imageFile);

      // Append categories/types/cuisines
      const selectedCategory = categories.find(c => c.id?.toString() === menu.categoryId?.toString() || c.name === menu.categoryId) || {};
      form.append("categoryId", selectedCategory.id || "");
      form.append("categoryName", selectedCategory.name || "");

      const selectedItemType = itemTypes.find(it => it.id?.toString() === menu.itemTypeId?.toString() || it.name === menu.itemTypeId || it.itemTypeName === menu.itemTypeId) || {};
      form.append("itemTypeId", selectedItemType.id || "");
      form.append("itemTypeName", selectedItemType.name || selectedItemType.itemTypeName || "");

      const selectedFoodType = foodTypes.find(f => f.id?.toString() === menu.foodTypeId?.toString() || f.name === menu.foodTypeId || f.foodTypeName === menu.foodTypeId) || {};
      form.append("foodTypeId", selectedFoodType.id || "");
      form.append("foodTypeName", selectedFoodType.name || selectedFoodType.foodTypeName || "");

      const selectedCuisine = cuisines.find(c => c.id?.toString() === menu.cuisineTypeId?.toString() || c.name === menu.cuisineTypeId || c.cuisineTypeName === menu.cuisineTypeId) || {};
      form.append("cuisineTypeId", selectedCuisine.id || "");
      form.append("cuisineTypeName", selectedCuisine.name || selectedCuisine.cuisineTypeName || "");

      // Append flags
      form.append("spiceLevel", menu.spiceLevel?.toString() || "1");
      form.append("isAvailable", menu.isAvailable ? "true" : "false");
      form.append("isRecommended", menu.isRecommended ? "true" : "false");
      form.append("isBestseller", menu.isBestseller ? "true" : "false");
      form.append("chefSpecial", menu.chefSpecial ? "true" : "false");
      form.append("preparationTime", menu.preparationTime?.toString() || "1");
      form.append("allergenInfo", menu.allergenInfo || "");

      // Variants/Addons/CustomizationGroups
      (menu.variants || []).forEach((v, i) => {
        if (v.id) form.append(`variants[${i}].id`, v.id);
        form.append(`variants[${i}].variantName`, v.variantName || "");
        form.append(`variants[${i}].variantType`, v.variantType || "");
        form.append(`variants[${i}].price`, v.price?.toString() || "0");
        form.append(`variants[${i}].discountPrice`, v.discountPrice?.toString() || "0");
        form.append(`variants[${i}].finalPrice`, v.finalPrice?.toString() || v.price?.toString() || "0");
        form.append(`variants[${i}].isDefault`, v.isDefault ? "true" : "false");
        form.append(`variants[${i}].isAvailable`, v.isAvailable ? "true" : "false");
        form.append(`variants[${i}].displayOrder`, v.displayOrder?.toString() || "0");
        form.append(`variants[${i}].displayText`, v.displayText || v.variantName || "");
        form.append(`variants[${i}].isDeleted`, v.isDeleted ? "true" : "false");
      });

      (menu.availableAddons || []).forEach((a, i) => {
        if (a.id) form.append(`availableAddons[${i}].id`, a.id);
        form.append(`availableAddons[${i}].name`, a.name || a.addOnName || "");
        form.append(`availableAddons[${i}].price`, a.price?.toString() || "0");
        form.append(`availableAddons[${i}].addonType`, a.addonType || "OPTIONAL");
        form.append(`availableAddons[${i}].isDefault`, a.isDefault ? "true" : "false");
        form.append(`availableAddons[${i}].maxQuantity`, a.maxQuantity?.toString() || "1");
        form.append(`availableAddons[${i}].isDeleted`, a.isDeleted ? "true" : "false");
      });

      (menu.customizationGroups || []).forEach((g, i) => {
        if (g.id) form.append(`customizationGroups[${i}].id`, g.id);
        form.append(`customizationGroups[${i}].name`, g.name || "");
        form.append(`customizationGroups[${i}].isRequired`, g.isRequired ? "true" : "false");
        form.append(`customizationGroups[${i}].selectionType`, g.selectionType || "SINGLE");
        form.append(`customizationGroups[${i}].maxSelections`, g.maxSelections?.toString() || "1");
        form.append(`customizationGroups[${i}].isDeleted`, g.isDeleted ? "true" : "false");
      });

      const res = await fetch(`${API_BASE}/update/${menu.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Update failed");
      }

      const data = await res.json();
      toast.success("Menu updated successfully!");
      setMenu(data);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update menu: " + (err.message || ""));
    }
  };

  if (loading) return <p>Loading menu details...</p>;
  if (!menu) return <p>Menu not found.</p>;

  const imageSrc = menu.imageData
    ? `data:image/jpeg;base64,${menu.imageData}`
    : menu.imageUrl?.replace(/\\/g, "/").replace("C:/dine-ease-backend/dine-ease/uploads/", "http://localhost:8082/dine-ease/uploads/");

  return (
    <div className="admin-menu-detail-container">
      {/* Back Button */}
      <button className="admin-menu-detail-close-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

      {/* Menu Header */}
      <div className="admin-menu-detail-header">
        <div className="admin-menu-detail-card">
          <img src={imageSrc} alt={menu.itemName} className="admin-menu-detail-image" />
        </div>

        <div className="admin-menu-detail-basic">
          <h2>{menu.itemName}</h2>
          <p>{menu.description}</p>
          <div className="admin-menu-detail-meta">
            <p><strong>Category:</strong> {menu.categoryName}</p>
            <p><strong>Item Type:</strong> {menu.itemType}</p>
            <p><strong>Food Type:</strong> {menu.foodType}</p>
            <p><strong>Cuisine:</strong> {menu.cuisineType}</p>
            <p><strong>Spice Level:</strong> {menu.spiceLevel}</p>
            <p><strong>Preparation Time:</strong> {menu.preparationTime} min</p>
            {menu.allergenInfo && <p><strong>Allergens:</strong> {menu.allergenInfo}</p>}
          </div>
          <div className="admin-menu-detail-flags">
            <span className={menu.isAvailable ? "admin-menu-detail-flag green" : "admin-menu-detail-flag red"}>
              {menu.isAvailable ? "Available" : "Unavailable"}
            </span>
            {menu.isRecommended && <span className="admin-menu-detail-flag blue">Recommended</span>}
            {menu.isBestseller && <span className="admin-menu-detail-flag gold">Bestseller</span>}
            {menu.chefSpecial && <span className="admin-menu-detail-flag orange">Chef’s Special</span>}
          </div>
        </div>

        {/* Edit/Delete Overlay */}
        <div className="admin-menu-detail-overlay">
          <button className="admin-menu-detail-edit-btn" onClick={handleUpdate}>
            <Edit3 size={15} /> Update
          </button>
          <button
            className="admin-menu-detail-delete-btn"
            onClick={async () => {
              if (!window.confirm("Are you sure you want to delete this menu item?")) return;
              try {
                const token = localStorage.getItem("token");
                if (!token) return toast.error("Unauthorized");
                const res = await fetch(`${API_BASE}/delete/${menu.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) throw new Error(await res.text() || "Delete failed");
                toast.success("Menu deleted successfully!");
                navigate("/AdminDashboard/menu");
              } catch (err) {
                console.error(err);
                toast.error("Failed to delete menu");
              }
            }}
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Variants */}
      {menu.variants?.length > 0 && (
        <div className="admin-menu-detail-menu-section">
          <h3>Variants</h3>
          <table className="admin-menu-detail-table">
            <thead>
              <tr>
                <th>Name</th><th>Type</th><th>Quantity</th><th>Price</th><th>Discount</th><th>Available</th>
              </tr>
            </thead>
            <tbody>
              {menu.variants.map((v, i) => (
                <tr key={i}>
                  <td>{v.variantName}</td>
                  <td>{v.variantType}</td>
                  <td>{v.quantityValue} {v.quantityUnit}</td>
                  <td>₹{v.price}</td>
                  <td>{v.discountPrice ? `₹${v.discountPrice}` : "-"}</td>
                  <td>{v.isAvailable ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Addons */}
      {menu.availableAddons?.length > 0 && (
        <div className="admin-menu-detail-section">
          <h3>Addons</h3>
          <ul className="admin-menu-detail-list">
            {menu.availableAddons.map((a, i) => (
              <li key={i}><strong>{a.name || a.addOnName}</strong> – ₹{a.price} ({a.addonType})</li>
            ))}
          </ul>
        </div>
      )}

      {/* Customization Groups */}
      {menu.customizationGroups?.length > 0 && (
        <div className="admin-menu-detail-section">
          <h3>Customization Groups</h3>
          <ul className="admin-menu-detail-list">
            {menu.customizationGroups.map((g, i) => <li key={i}>{g.name}</li>)}
          </ul>
        </div>
      )}

      {/* Suggested Items */}
      {suggested.length > 0 && (
        <div className="admin-menu-detail-section">
          <h3>Similar Menu Items</h3>
          <div className="admin-menu-detail-grid">
            {suggested.map((item) => {
              const img = item.imageData
                ? `data:image/jpeg;base64,${item.imageData}`
                : item.imageUrl?.replace("C:\\dine-ease-backend\\dine-ease\\uploads\\", "http://localhost:8082/dine-ease/uploads/");
              return (
                <div key={item.id} className="admin-menu-detail-card" onClick={() => navigate(`/AdminDashboard/menu/${item.id}`)}>
                  <img src={img} alt={item.itemName} className="admin-menu-detail-suggested-img" />
                  <h4>{item.itemName}</h4>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Items */}
      {recommendedItems.length > 0 && (
        <div className="admin-menu-detail-section">
          <h3>Recommended Items</h3>
          <div className="admin-menu-detail-grid">
            {recommendedItems.map((item) => {
              const img = item.imageData
                ? `data:image/jpeg;base64,${item.imageData}`
                : item.imageUrl?.replace(/\\/g, "/").replace("C:/dine-ease-backend/dine-ease/uploads/", "http://localhost:8082/dine-ease/uploads/");
              return (
                <div
                  key={item.id}
                  className="admin-menu-detail-recommended-card"
                  onClick={() => {
                    if (Number(item.id) === Number(id)) {
                      setMenu(null);
                      setLoading(true);
                      const token = localStorage.getItem("token");
                      fetch(`${API_BASE}/${item.id}`, { headers: { Authorization: `Bearer ${token}` } })
                        .then(res => res.json())
                        .then(data => setMenu(data))
                        .catch(err => console.error(err))
                        .finally(() => setLoading(false));
                    } else {
                      navigate(`/AdminDashboard/menu/${item.id}`);
                    }
                  }}
                >
                  <img src={img} alt={item.itemName} className="admin-menu-detail-recommended-img" />
                  <h4>{item.itemName}</h4>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
