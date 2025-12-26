import { useState, useEffect, useRef, useCallback } from "react";
import "./customerDashboard.css";
import CustomerDashboardNav from "../customerNavbar/customerDashboardNav";
import CustomerMenuSection from "../customerMenu/customerMenuSection";
import CustomerMenuCategories from "../customerMenuCategory/customerMenuCategories";
import CustomerBestsellerCarousel from "../customerMenu/CustomerBestsellerCarousel";
import Footer from "../../components/footer/Footer";
import { useSession } from "../../context/SessionContext";
import { Outlet } from "react-router-dom";


const CustomerDashboard = () => {
  const { sessionId, tableId, orgId } = useSession();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const menuSectionRef = useRef(null);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [selectedItemIdFromCarousel, setSelectedItemIdFromCarousel] = useState(null);

  
  // Prevent back navigation
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname);
    };
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Receive full menu list from MenuSection
  const handleMenuLoad = useCallback((data) => {
    setAllMenuItems(data);
    console.log("🍽️ Menu loaded in parent:", data.length, "items");
  }, []);

  useEffect(() => {
    console.log("🏠 CustomerDashboard Loaded", { orgId, tableId, sessionId });
  }, [orgId, tableId, sessionId]);

  const handleCategorySelect = (category) => {
    setSelectedCategory((prev) =>
      prev?.id === category.id ? null : category
    );

    setTimeout(() => {
      menuSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  };

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    setSelectedCategory(null); // Reset category on search
  };


  return (
   <div className="customer-dashboard-wrapper">

  {/* Sticky Navbar */}
  <div className="dashboard-navbar-wrapper">
    <CustomerDashboardNav
      onSearch={handleSearch}
      allMenuItems={allMenuItems}
    />
  </div>

  {/* Sticky Categories */}
  <div className="dashboard-category-wrapper">
    <CustomerMenuCategories
      onCategorySelect={handleCategorySelect}
      selectedCategory={selectedCategory}
    />
  </div>

  {/* Bestseller Carousel */}
  {!searchKeyword && allMenuItems.length > 0 && (
    <section className="dashboard-carousel-wrapper">
      <CustomerBestsellerCarousel
        items={allMenuItems}
        onItemSelect={setSelectedItemIdFromCarousel}
      />
    </section>
  )}

  {/* Menu Section */}
  <section className="dashboard-menu-wrapper">
    <CustomerMenuSection
      ref={menuSectionRef}
      selectedCategory={selectedCategory}
      searchKeyword={searchKeyword}
      onMenuLoad={handleMenuLoad}
      externalSelectedItemId={selectedItemIdFromCarousel}
    />
  </section>

  <Footer />
</div>

  );
};

export default CustomerDashboard;
