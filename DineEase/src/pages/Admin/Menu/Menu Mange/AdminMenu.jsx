import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusSquare } from "lucide-react";
import { getAllMenus, fetchProfile } from "./Api/menuApi";
import "./AdminMenu.css";

export default function AdminMenu() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 5 items per page
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

  // Pagination logic
  const totalPages = Math.ceil(menus.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMenus = menus.slice(startIndex, startIndex + itemsPerPage);

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
        {currentMenus.length === 0 ? (
          <p>No menus found</p>
        ) : (
          currentMenus.map((menu) => {
            const isVeg = menu.itemType === "VEG" || menu.itemTypeName === "VEG";

            const imagePreview =
              menu.imageData
                ? `data:image/jpeg;base64,${menu.imageData}`
                : menu.imageUrl
                  ? menu.imageUrl
                  : null;

            return (
              <div
                key={menu.id}
                className="admin-menu-menu-card"
                onClick={() =>
                  navigate(`/AdminDashboard/menu/details/${menu.id}`, { state: { menu } })
                }
              >
                <div className="admin-menu-img-wrapper">
                  {imagePreview ? (
                    <img src={imagePreview} alt={menu.itemName} className="admin-menu-image-preview" />
                  ) : (
                    <div className="admin-menu-image-placeholder">No Image</div>
                  )}
                  <span className={`admin-menu-veg-badge ${isVeg ? "veg" : "non-veg"}`}>
                    {isVeg ? "VEG" : "NON-VEG"}
                  </span>
                </div>

                <h3>{menu.itemName}</h3>
                <p className="admin-menu-category">{menu.categoryName}</p>

                {/* PRICE BLOCK */}
                <div className="admin-menu-price-block">
                  {menu.variants?.length > 0 && (
                    <>
                      <span className="admin-menu-old-price">₹{menu.variants[0].price}</span>
                      <span className="admin-menu-final-price">₹{menu.variants[0].finalPrice}</span>
                      <span className="admin-menu-discount">{menu.variants[0].discountPrice} % OFF</span>
                    </>
                  )}
                </div>

                <span className="admin-menu-view-more">View Details →</span>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINATION */}
      <div className="admin-menu-pagination">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
