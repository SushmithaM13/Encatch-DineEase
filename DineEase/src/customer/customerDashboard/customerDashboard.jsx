import { useState, useEffect, useRef } from "react";
import "./customerDashboard.css";
import CustomerDashboardNav from "../customerNavbar/customerDashboardNav";
import CustomerMenuSection from "../customerMenu/customerMenuSection";
import CustomerMenuCategories from "../customerMenuCategory/customerMenuCategories";
import { useCustomer } from "../../context/CustomerContext";
import Footer from "../../components/footer/Footer";

const CustomerDashboard = () => {
  const [tab, setTab] = useState("menu");
  const { orgId, tableId } = useCustomer();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const menuSectionRef = useRef(null);
  const [allMenuItems, setAllMenuItems] = useState([]);

  useEffect(() => {
    console.log("🏠 CustomerDashboard Loaded", { orgId, tableId });
  }, [orgId, tableId]);

  const handleCategorySelect = (category) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
    setTimeout(() => {
      menuSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
  };

  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname);
    };
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (!orgId) {
    return (
      <div className="missing-org">
        ⚠️ Missing organization details. Please scan QR again.
      </div>
    );
  }

  return (
    <div className="customer-dashboard-wrapper">
      <header className="customer-dashboard-navbar">
        <CustomerDashboardNav onTabChange={setTab} onSearch={handleSearch} allMenuItems={allMenuItems}/>
      </header>

      <CustomerMenuCategories 
        onCategorySelect={handleCategorySelect} 
        selectedCategory={selectedCategory}  
      />

      <main className="customer-dashboard-content">
        {tab === "menu" && (
          <CustomerMenuSection ref={menuSectionRef} selectedCategory={selectedCategory} 
          searchKeyword={searchKeyword} onMenuLoad={setAllMenuItems}/>
        )}
      </main>

      <footer className="customer-dashboard-footer">
        <Footer />
      </footer>
    </div>
  );
};

export default CustomerDashboard;
