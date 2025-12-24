import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusSquare } from "lucide-react";
import { getAllMenus, fetchProfile } from "./Api/menuApi";
import "./AdminMenu.css";

export default function AdminMenu() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {

    async function loadMenus() {
      try {
        const profile = await fetchProfile();

        const data = await getAllMenus(profile.organizationId);
        console.log("Menus data:", data);

        setMenus(data);

      } catch (err) {
        console.error(err);
        alert("Failed to fetch menus");
      } finally {
        setLoading(false);
      }
    }
    loadMenus();
  }, []);

  if (loading) return <p>Loading menus...</p>;

  return (
    <div className="admin-menu-container">
      {/* HEADER */}
      <div className="admin-menu-header">
        <h2>Menu List</h2>

        <button
          className="admin-menu-add-menu-btn"
          onClick={() => navigate("/AdminDashboard/menu/add")}
        >
          <PlusSquare size={18} /> Add Menu
        </button>
      </div>

      {/* GRID */}
      <div className="admin-menu-menu-grid">
        {menus.length === 0 ? (
          <p>No menus found</p>
        ) : (
          menus.map((menu) => {
            const isVeg = menu.itemType === "VEG" || menu.itemTypeName === "VEG";

            // Derive preview
            const imagePreview =
              menu.imageData

                ? `data:image/jpeg;base64,${menu.imageData}`
                : menu.imageUrl
                  ? menu.imageUrl

                  : null;
            console.log("Menu Image Data:", menu.imageData);
            console.log("Menu Image URL:", menu.imageUrl);


            return (
              <div
                key={menu.id}
                className="admin-menu-menu-card"
                onClick={() =>
                  navigate(`/AdminDashboard/menu/details/${menu.id}`, {
                    state: { menu },
                  })
                }
              >
                <div className="menu-img-wrapper">
                  {imagePreview ? (
                    <img src={imagePreview} alt={menu.itemName} className="menu-image-preview" />
                  ) : (
                    <div className="menu-image-placeholder">No Image</div>
                  )}
                  <span className={`veg-badge ${isVeg ? "veg" : "non-veg"}`}>
                    {isVeg ? "VEG" : "NON-VEG"}
                  </span>
                </div>

                <h3>{menu.itemName}</h3>
                <p className="category">{menu.categoryName}</p>
                <p className="cuisine">{menu.cuisineTypeName}</p>
                <p className="price">
                  ₹{menu.variants?.length ? menu.variants[0].finalPrice || menu.variants[0].price : 0}
                </p>
                <span className="admin-menu-view-more">View Details →</span>
              </div>
            );
          })

        )}
      </div>
    </div>
  );
}
