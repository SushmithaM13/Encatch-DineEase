import { useEffect, useState } from "react";
import { fetchMenuCategories } from "../api/customerMenuCategoryAPI";
// import { useCustomer } from "../../context/CustomerContext";
import "./customerMenuCategories.css";
import { useSession } from "../../context/SessionContext";

const CustomerMenuCategories = ({ onCategorySelect, selectedCategory }) => {
  // const { orgId } = useCustomer();
  const { orgId } = useSession();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Add shadow only when scrolling down past navbar height
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!orgId) return;
      setLoading(true);
      try {
        const result = await fetchMenuCategories(orgId);
        setCategories(result);
        setError(null);
      } catch (err) {
        setError("Failed to load categories. Please try again.",err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orgId]);

  if (loading)
    return <div className="menu-loading"><p>Loading categories...</p></div>;

  if (error)
    return <div className="menu-error"><p>{error}</p></div>;

  if (categories.length === 0)
    return <div className="menu-empty"><p>No categories found</p></div>;

  return (
    <div className={`category-scroll-container ${isSticky ? "sticky-active" : ""}`}>
      <div className="category-scroll">
        {categories.map((category) => {
          const isActive = selectedCategory?.id === category.id;
          return (
            <div
              key={category.id}
              className={`category-item ${isActive ? "active" : ""}`}
              onClick={() => onCategorySelect(category)}
            >
              <div className="category-image-wrapper">
                {category.imageData ? (
                  <img
                    src={`data:image/jpeg;base64,${category.imageData}`}
                    alt={category.name}
                    className="category-image"
                  />
                ) : (
                  <div className="category-no-image">No Image</div>
                )}
              </div>
              <p className="category-name">{category.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerMenuCategories;
