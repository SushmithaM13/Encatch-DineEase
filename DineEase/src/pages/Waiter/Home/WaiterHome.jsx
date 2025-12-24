import { useEffect, useState } from "react";
import {
  ClipboardList,
  ChefHat,
  CheckCircle,
  Plus,
  Sofa,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./WaiterHome.css";
import { useNavigate } from "react-router-dom";

export default function WaiterHome() {
  const navigate = useNavigate();

  const TOKEN =
    localStorage.getItem("token") || localStorage.getItem("staffToken");
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const MENU_API = "http://localhost:8082/dine-ease/api/v1/menu/getAll";

  const [waiterName, setWaiterName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  // const [profilePic, setProfilePic] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);

  const [menu, setMenu] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);

  // Fetch profile (get organizationId)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!TOKEN) return;
      try {
        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();

        setWaiterName(data.firstName || "Waiter");
        setRestaurantName(data.organizationName || "Restaurant");
        // if (data.profileImage) setProfilePic(`data:image/jpeg;base64,${data.profileImage}`);
        if (data.organizationId) setOrganizationId(data.organizationId);
      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();

    // Demo orders & payments for UI while backend pages are building
    setOrders([
      { orderId: 101, tableNumber: 3, orderStatus: "NEW" },
      { orderId: 102, tableNumber: 1, orderStatus: "IN_PROGRESS" },
      { orderId: 103, tableNumber: 5, orderStatus: "SERVING" },
      { orderId: 104, tableNumber: 2, orderStatus: "COMPLETED" },
    ]);

    setPayments([
      { id: 1, tableNumber: 2, customerId: "C-9821", amount: 450, status: "PENDING" },
      { id: 2, tableNumber: 5, customerId: "C-7724", amount: 920, status: "PENDING" },
      { id: 3, tableNumber: 1, customerId: "C-6611", amount: 180, status: "PENDING" },
    ]);
  }, [TOKEN]);

  // Fetch menu once we have organizationId
  useEffect(() => {
    if (!organizationId) return;

    const fetchMenu = async () => {
      setLoadingMenu(true);
      try {
        const res = await fetch(`${MENU_API}?organizationId=${organizationId}`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });

        if (!res.ok) {
          console.error("Menu fetch failed:", res.status);
          toast.error("Failed to fetch menu");
          setMenu([]);
          setLoadingMenu(false);
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data.content) ? data.content : Array.isArray(data) ? data : [];
        setMenu(list);
      } catch (err) {
        console.error("Menu fetch error:", err);
        toast.error("Failed to fetch menu");
        setMenu([]);
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchMenu();
  }, [organizationId, TOKEN]);

  // Navigation helpers — cart lives in WaiterDashboard
  // const goToCart = () => {
  //   // Open dashboard's cart view / menu page — adjust route to your routing
  //   navigate("/WaiterDashboard");
  //   // if you have a dedicated cart route, use that instead:
  //   // navigate("/WaiterDashboard/cart");
  // };

  const openMenuItem = (item) => {
    // navigate to menu item details page in Dashboard (change route if needed)
    navigate("/WaiterDashboard/menu/item", { state: { item } });
  };

  const handleAddFromHome = (item) => {
    // since cart is in dashboard, redirect user where they can add
    navigate("/WaiterDashboard/menu", { state: { highlightItem: item } });
  };

  return (
    <div className="waiter-home-dashboard-page">
      <ToastContainer position="top-right" autoClose={1600} />

      <header className="waiter-home-top">
        <div>
          <h2 className="waiter-home-welcome">Welcome, {waiterName}</h2>
          <h4 className="waiter-home-restaurant">{restaurantName}</h4>
        </div>

        
      </header>

      {/* Stats */}
      <div className="waiter-home-stats-cards">
        <div className="waiter-home-card">
          <ClipboardList size={28} className="waiter-home-card-icon" />
          <h4>{orders.filter((o) => o.orderStatus === "NEW").length}</h4>
          <p>New Orders</p>
        </div>

        <div className="waiter-home-card">
          <ChefHat size={28} className="waiter-home-card-icon" />
          <h4>{orders.filter((o) => ["IN_PROGRESS", "SERVING"].includes(o.orderStatus)).length}</h4>
          <p>Ongoing</p>
        </div>

        <div className="waiter-home-card">
          <CheckCircle size={28} className="waiter-home-card-icon" />
          <h4>{orders.filter((o) => o.orderStatus === "COMPLETED").length}</h4>
          <p>Completed</p>
        </div>

        <div className="waiter-home-card">
          <Sofa size={28} className="waiter-home-card-icon" />
          <h4>{orders.filter((o) => o.orderStatus === "COMPLETED").length}</h4>
          <p>Tables</p>
        </div>
      </div>

      {/* Side-by-side Orders + Payments */}
      <div className="waiter-home-row">
        <div className="waiter-home-box">
          <div className="waiter-home-section-header">
            <span>Recent Orders</span>
            <button className="small-link" onClick={() => navigate("/WaiterDashboard/orders")}>View all</button>
          </div>

          <div className="waiter-home-preview-list">
            {orders.slice(0, 6).map((o) => (
              <div key={o.orderId} className="waiter-home-preview-card order-card">
                <ClipboardList size={20} color="#0056d2" />
                <div className="order-meta">
                  <strong>Order #{o.orderId}</strong>
                  <p>Table {o.tableNumber}</p>
                </div>
                <span className={`status-tag ${o.orderStatus.toLowerCase()}`}>{o.orderStatus}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="waiter-home-box">
          <div className="waiter-home-section-header">
            <span>Payments</span>
            <button className="small-link" onClick={() => navigate("/WaiterDashboard/payments")}>View all</button>
          </div>

          <div className="payment-table">
            {payments.map((p) => (
              <div key={p.id} className="payment-row">
                <div className="payment-left">
                  <div><strong>Table:</strong> {p.tableNumber}</div>
                  <div className="muted"><strong>Customer:</strong> {p.customerId}</div>
                </div>

                <div className="payment-right">
                  <div className="amount">₹{p.amount}</div>
                  <button
                    className="pay-btn"
                    onClick={() => {
                      toast.success(`Payment processed ₹${p.amount}`);
                      setPayments((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: "PAID" } : x)));
                    }}
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="waiter-menu-section">
        <div className="waiter-home-section-header">
          <span>Menu</span>
          <button className="small-link" onClick={() => navigate("/WaiterDashboard/menu")}>View all</button>
        </div>

        {loadingMenu ? (
          <p>Loading menu...</p>
        ) : menu.length === 0 ? (
          <div className="waiter-menu-grid">
            {/* fallback demo items */}
            {[
              { itemName: "Paneer Butter Masala", itemType: "VEG", basePrice: 240, imageData: "" },
              { itemName: "Chicken Biryani", itemType: "NON-VEG", basePrice: 320, imageData: "" },
              { itemName: "Spring Roll", itemType: "VEG", basePrice: 120, imageData: "" },
            ].map((it, idx) => (
              <div key={idx} className="menu-card">
                <img src="/placeholder-food.jpg" alt={it.itemName} className="menu-img" />
                <h4>{it.itemName}</h4>
                <p className="menu-category">{it.itemType}</p>
                <div className="menu-bottom">
                  <span className="price">₹{it.basePrice}</span>
                  <button className="add-btn" onClick={() => handleAddFromHome(it)}>
                    <Plus size={14} />
                    <span className="btn-label">Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="waiter-menu-grid">
            {menu.map((item) => (
              <div key={item.id ?? item.itemName} className="menu-card">
                <img
                  src={item.imageData ? `data:image/jpeg;base64,${item.imageData}` : "/placeholder-food.jpg"}
                  alt={item.itemName}
                  className="menu-img"
                  onClick={() => openMenuItem(item)}
                />
                <h4>{item.itemName}</h4>
                <p className="menu-category">{item.categoryName || "Uncategorized"}</p>

                <div className={`tag ${item.itemType === "VEG" ? "veg" : "nonveg"}`}>{item.itemType}</div>

                <div className="menu-bottom">
                  <span className="price">₹{item.basePrice ?? item.price ?? 0}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="add-btn" onClick={() => handleAddFromHome(item)}>
                      <Plus size={14} />
                      <span className="btn-label">Add</span>
                    </button>
                    <button className="details-btn" onClick={() => openMenuItem(item)}>
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
