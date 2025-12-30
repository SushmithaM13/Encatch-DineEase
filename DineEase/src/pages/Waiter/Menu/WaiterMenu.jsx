/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./WaiterMenu.css";
import WaiterMenuCategorie from "./WaiterMenuCategorie";
import WaiterMenuItemPopup from "./WaiterMenuItemPopup";
import WaiterCart from "../Cart/WaiterCart";


import { ShoppingCart } from "lucide-react";

import {
  addItemToCartFromMenu,
  getCart 
} from "../api/WaiterCartApi";

import {
  getStaffProfile,
  getAllMenuItems,
  getMenuByCategory,
  getMenuByType,
  getMenuTypes,
} from "../api/WaiterMenuApi";

import { fetchMenuCategories } from "../api/WaiterMenuCategoriesApi";

export default function WaiterMenu() {
  /* ---------------- BASIC STATE ---------------- */
  const [organizationId, setOrganizationId] = useState("");
  const [menus, setMenus] = useState([]);
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [itemTypeFilter, setItemTypeFilter] = useState("ALL");
  const [activeItem, setActiveItem] = useState(null);

  /* ---------------- CART STATE ---------------- */
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  // bottom sticky bar count
  const [showBottomCart, setShowBottomCart] = useState(false);

  /* ---------------- URL PARAMS ---------------- */
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const tableNumber = searchParams.get("tableNumber");
  const reservedTableSource = searchParams.get("source");

  const TOKEN = localStorage.getItem("token");


  /* ---------------- VALIDATION ---------------- */
  useEffect(() => {
    if (!sessionId || !tableNumber) {
      toast.error("Invalid table session");
    }
  }, [sessionId, tableNumber]);

  /* ---------------- FETCH STAFF PROFILE ---------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getStaffProfile();
        setOrganizationId(data.organizationId);
      } catch {
        toast.error("Failed to load staff profile");
      }
    };
    fetchProfile();
  }, []);

  /* ---------------- MENU TYPES ---------------- */
  useEffect(() => {
    if (!organizationId) return;

    const loadTypes = async () => {
      try {
        const data = await getMenuTypes(organizationId);
        setTypes(data || []);
      } catch {
        toast.error("Failed to load menu types");
      }
    };

    loadTypes();
  }, [organizationId]);

  /* ---------------- CATEGORIES ---------------- */
  useEffect(() => {
    if (!organizationId) return;

    const loadCategories = async () => {
      try {
        const data = await fetchMenuCategories(organizationId);
        setCategories(data || []);
      } catch {
        toast.error("Failed to load categories");
      }
    };

    loadCategories();
  }, [organizationId]);

  /* ---------------- MENU ITEMS ---------------- */
  const loadMenus = async () => {
    if (!organizationId) return;

    try {
      let data = [];

      if (selectedCategory) {
        data = await getMenuByCategory(selectedCategory.name);
      } else if (itemTypeFilter !== "ALL") {
        data = await getMenuByType(organizationId, itemTypeFilter);
      } else {
        data = await getAllMenuItems(organizationId);
      }

      setMenus(data || []);
    } catch {
      toast.error("Failed to fetch menu items");
    }
  };

  useEffect(() => {
    loadMenus();
  }, [organizationId, selectedCategory, itemTypeFilter]);

  /* ---------------- CART buttom  ---------------- */
  useEffect(() => {
    const handler = () => setShowBottomCart(true);
    window.addEventListener("cartItemAdded", handler);
    return () => window.removeEventListener("cartItemAdded", handler);
  }, []);



  /* ---------------- ADD TO CART ---------------- */
const handleAddToCart = async (payload) => {
  if (!payload?.selectedVariant?.id) {
    toast.error("Variant not selected");
    return;
  }

  try {
    await addItemToCartFromMenu(
      organizationId,
      {
        menuItemVariantId: payload.selectedVariant.id,
        quantity: 1,
        addons: payload.addons || [],
        customizations: payload.customizations || [],
        sessionId,
        tableNumber,
      },
      TOKEN
    );

    // Immediately update cart
    updateCartCount();

    window.dispatchEvent(new Event("cartItemAdded"));

    window.dispatchEvent(new Event("cartUpdated"));

    setActiveItem(null);
  } catch (err) {
    console.error("Add to cart failed:", err);
    toast.error("Failed to add item");
  }
};
const updateCartCount = async () => {
  try {
    const cart = await getCart(organizationId, sessionId, tableNumber);
    const qty = cart?.totalQuantity || 0;

    setCartCount(qty);
    setShowBottomCart(qty > 0); 
  } catch {
    console.log("Failed to update cart");
  }
};


  useEffect(() => {
  const loadCartCount = async () => {
    try {
      const cart = await getCart(organizationId, sessionId, tableNumber);
      const totalQty = cart?.totalQuantity || 0;


      setCartCount(totalQty);

      // Only show on first load if there are items
      if (totalQty > 0) setShowBottomCart(true);
    } catch {
      console.log("Failed to fetch cart");
    }
  };

  if (organizationId) loadCartCount();
}, [organizationId]);

useEffect(() => {
  if (organizationId) updateCartCount();
}, [organizationId]);



  /* ===================================================== */

  return (
    <div className="waiter-menu-sidebar">
      <ToastContainer />
      {/* SESSION INFO */}
      {sessionId && tableNumber && (
        <div className="waiter-menu-session-info">
          <div className="session-text">
            <p><strong>Table:</strong> {tableNumber}</p>
            <p><strong>Session:</strong> {sessionId}</p>
            <p><strong>Source:</strong> {reservedTableSource}</p>
          </div>

          {/* CART ICON – HIDE WHEN VARIANT POPUP OPEN */}
          {!cartOpen && !activeItem && (
            <div
              className="waiter-menu-cart-icon yellow-cart"
              onClick={() => {
                setCartOpen(true);
                window.dispatchEvent(new Event("openCart"));
              }}
            >
              <ShoppingCart size={20} />

              {cartCount > 0 && (
                <span className="cart-count-badge">{cartCount}</span>
              )}
            </div>
          )}

        </div>
      )}

      {/* CATEGORY SCROLL */}
      <WaiterMenuCategorie
        organizationId={organizationId}
        categories={categories}
        selectedCategory={selectedCategory}
        types={types}
        setSelectedCategory={setSelectedCategory}
      />


      {/* TYPE FILTER */}
      <div className="waiter-menu-switches">
        <label className="waiter-menu-switch">
          <input
            type="checkbox"
            checked={itemTypeFilter === "VEG"}
            onChange={(e) =>
              setItemTypeFilter(e.target.checked ? "VEG" : "ALL")
            }
          />
          <span className="waiter-menu-slider veg-slider"></span>
        </label>
        <span className="waiter-menu-switch-label">Veg</span>

        <label className="waiter-menu-switch">
          <input
            type="checkbox"
            checked={itemTypeFilter === "NON-VEG"}
            onChange={(e) =>
              setItemTypeFilter(e.target.checked ? "NON-VEG" : "ALL")
            }
          />
          <span className="waiter-menu-slider nonveg-slider"></span>
        </label>
        <span className="waiter-menu-switch-label">Non-Veg</span>
      </div>

      {/* MENU GRID */}
      <div className="waiter-menu-grid">
        {menus.length === 0 ? (
          <p className="waiter-menu-no-menu-text">No menu items found.</p>
        ) : (
          menus.map(item => (
            <div key={item.id} className="waiter-menu-card">
              <div className="waiter-menu-img-wrap">
                {item.imageData ? (
                  <img
                    src={`data:image/jpeg;base64,${item.imageData}`}
                    alt={item.itemName}
                  />
                ) : (
                  <div className="waiter-menu-no-img-box">No Image</div>
                )}
              </div>

              <h3 className="waiter-menu-title">{item.itemName}</h3>
              <p className="waiter-menu-desc">{item.description}</p>

              <p className="waiter-menu-tags">
                <span
                  className={item.itemType === "VEG" ? "waiter-menu-veg-dot" : "waiter-menu-nonveg-dot"}
                ></span>
                {item.itemType} • {item.cuisineType}
              </p>

              <div className="waiter-menu-bottom">
                <p className="waiter-menu-price">
                  ₹
                  {item.variants?.length
                    ? Math.min(...item.variants.map(v => Number(v.price)))
                    : "N/A"}
                </p>

                <button
                  className="waiter-menu-addcart-btn"
                  onClick={() => setActiveItem(item)}
                >
                  ADD
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* POPUP */}
      {activeItem && (
        <WaiterMenuItemPopup
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* CART DRAWER */}
      <div className={`waiter-menu-cart-drawer ${cartOpen ? "open" : ""}`}>
        <WaiterCart
          organizationId={organizationId}
          token={TOKEN}
          closeCart={() => setCartOpen(false)}
        />
      </div>

      {cartOpen && (
        <div
          className="waiter-menu-cart-overlay"
          onClick={() => setCartOpen(false)}
        />
      )}
     {showBottomCart && !cartOpen && !activeItem && (
  <div
    className="waiter-menu-cart-bottom-cart-bar"
    onClick={() => {
      setCartOpen(true);
      window.dispatchEvent(new Event("openCart"));
    }}
  >
    <div className="waiter-menu-cart-left">
      {cartCount} item{cartCount > 1 ? "s" : ""} added
    </div>
    <div className="waiter-menu-cart-right">View Cart →</div>
  </div>
)}


    </div>
  );
}
