import { Routes, Route } from 'react-router-dom';
import './App.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from 'react';


// ===== Auth Pages =====
import Login from "./components/Auth/login";
import ForgotPassword from "./components/Auth/forgotPassword";
import ProtectedRoute from "./components/Auth/protectedRoute";
import ResetPassword from "./components/Auth/resetPassword";
import SuperAdminRegistration from "./components/signup/SuperAdminRegistration";

// ===== Super Admin Pages =====
import SuperAdminDashboard from "./pages/superadmin/dashboard/superAdminDashboard";
import UserManagement from "./pages/superadmin/usermanagement/UserManagement";
// import Reports from "./pages/superadmin/Reports/Reports";
import SuperAdminHome from "./pages/superadmin/dashboard/SuperAdminHome";
import TableManagement from "./pages/superadmin/tablemanagemnet/TableManagement";
import AddStaffRole from './pages/superadmin/staffroles/AddStaffRole';
import SuperAdminProfile from "./pages/superadmin/profile/SuperAdminProfile";
import SuperAdminSettings from "./pages/superadmin/settings/SuperAdminSettings";

// ===== New Menu Dashboard (Tabbed) =====
import MenuDashboard from "./pages/superadmin/menu/MenuDashboard/MenuDashboard";

//ADD menu Iteams 
import AddMenuForm from "./pages/superadmin/menu/AddMenuForm/SuperAdminMenu";
import SuperAdminMenu from "./pages/superadmin/menu/AddMenuForm/SuperAdminMenu";
import SuperAdminMenuDetails from './pages/superadmin/menu/AddMenuForm/SuperAdminMenuDetails';
import SuperAdminAddEditMenu from './pages/superadmin/menu/AddMenuForm/SuperAdminAddEditMenu';

//Menu Categoryes
import CategoryForm from "./pages/superadmin/menu/CategoryForm/CategoryForm";
import AddItemtype from "./pages/superadmin/menu/AddItemForm/AddItemtype";
import Foodtype from "./pages/superadmin/menu/Foodtype/Foodtype";
import Cuisinetype from "./pages/superadmin/menu/cuisinetype/cuisinetype";
import AddonForm from "./pages/superadmin/menu/AddonForm/AddonForm";
import CustomizationGroupForm from "./pages/superadmin/menu/CustomizationGroupForm/CustomizationGroupForm";

// ===== Admin Pages =====
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import AdminHome from "./pages/Admin/Home/AdminHome";
import AdminProfile from "./pages/Admin/Profile/AdminProfile";
import AdminTableManagement from "./pages/Admin/Table/AdminTableManagement";
import RoleManagement from "./pages/Admin/Role/RoleManagement";
import AdminStaffManagement from "./pages/Admin/Staff/AdminStaffManagement";
import AdminSettings from "./pages/Admin/Settings/AdminSettings";
import AdminRevenueManagement from "./pages/Admin/Revenue/AdminRevenueManagement";

// ===== Admin Menu Management Pages =====
import AdminMenu from "./pages/Admin/Menu/Manage Menus/AdminMenu";
import AdminMenuDetail from "./pages/Admin/Menu/Manage Menus/AdminMenuDetail";
import AdminMenuCategory from "./pages/Admin/Menu/MenuCategory/AdminMenuCategory";
import AdminFoodType from "./pages/Admin/Menu/FoodType/AdminFoodType";
import AdminItemType from "./pages/Admin/Menu/ItemType/AdminItemType";
import AdminCustomizationGroups from "./pages/Admin/Menu/CustomizationGroups/AdminCustomizationGroups";
import AdminAddon from "./pages/Admin/Menu/AddOn/AdminAddon";
import AdminCusineType from "./pages/Admin/Menu/CuisineType/AdminCusineType";

// ===== Waiter Pages =====
import WaiterDashboard from "./pages/Waiter/WaiterDashboard/WaiterDashboard";
import WaiterHome from "./pages/Waiter/Home/WaiterHome";
import WaiterReservation from "./pages/Waiter/WaiterReservation/WaiterReservation";
import WaiterSettings from "./pages/Admin/Settings/AdminSettings";
import WaiterProfile from "./pages/Waiter/Profile/WaiterProfile";

// ===== Chef Pages =====
//import ChefHome from "./pages/Chef/ChefHome/ChefHome";
import ChefHomePage from "./pages/Chef/ChefHomepage/ChefHomepage";
import ChefDashboard from "./pages/Chef/ChefDashboard/ChefDashboard";
import ChefMenuCatalog from './pages/Chef/ChefMenuCatalog/ChefMenuCatalog';
import OrderQueue from "./pages/Chef/OrderQueue/OrderQueue";
import Inventory from "./pages/Chef/Inventory/Inventory";
import ChefProfile from "./pages/Chef/Profile/ChefProfile";

import Footer from './components/footer/Footer';

// ===== Customer pages =====
import CustomerLogin from './customer/customerLogin/customerLogin';
import OTPVerification from './customer/customerLogin/otpVerification';
import CustomerDashboard from './customer/customerDashboard/customerDashboard';

import EnterSessionId from './customer/customerLogin/EnterSessionId';
import CustomerCart from "./customer/customercart/CustomerCart";


function App() {

  // ✅ Only store URL token — do NOT redirect auto
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const authToken = params.get("authToken");
      const role = params.get("role");

      if (authToken && role) {
        localStorage.setItem("token", authToken);
        localStorage.setItem("role", role);

        // Remove token from URL after storing
        const cleanURL =
          window.location.origin +
          window.location.pathname +
          window.location.hash;

        window.history.replaceState({}, document.title, cleanURL);
      }
    } catch (e) {
      console.error("Error processing auth token from URL:", e);
    }
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/SuperAdminRegistration" element={<SuperAdminRegistration />} />

        {/* SUPER ADMIN */}
        <Route path="/SuperAdminDashboard/*"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperAdminHome />} />
          <Route path="staff" element={<UserManagement />} />
          {/* <Route path="reports" element={<Reports />} /> */}
          <Route path="home" element={<SuperAdminHome />} />
          <Route path="profile" element={<SuperAdminProfile />} />
          <Route path="settings" element={<SuperAdminSettings />} />


          <Route path="menu-dashboard" element={<MenuDashboard />} />


          <Route path="AddMenu-form" element={<AddMenuForm />} />
          <Route path="menu/details/:menuId" element={<SuperAdminMenuDetails />} /> 
          <Route path="menu/list" element={<SuperAdminMenu />} />
          <Route path="menu/add" element={<SuperAdminAddEditMenu />}/>
          <Route path="menu/edit/:menuId" element={<SuperAdminAddEditMenu />} />


          <Route path="category-form" element={<CategoryForm />} />
          <Route path="add-item-type" element={<AddItemtype />} />
          <Route path="food-type" element={<Foodtype />} />
          <Route path="cuisine-type" element={<Cuisinetype />} />
          
          <Route path="addon-form" element={<AddonForm />} />
          <Route path="customization-group-form" element={<CustomizationGroupForm />} />

          <Route path="staffrole" element={<AddStaffRole />} />
          <Route path="table" element={<TableManagement />} />
        </Route>

        {/* ADMIN */}
        <Route path="/AdminDashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="home" element={<AdminHome />} />
          <Route path="dashboard" element={<AdminHome />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="menu/:id" element={<AdminMenuDetail />} />
          <Route path="menu-category" element={<AdminMenuCategory />} />
          <Route path="cuisine-type" element={<AdminCusineType />} />
          <Route path="food-type" element={<AdminFoodType />} />
          <Route path="item-type" element={<AdminItemType />} />
          <Route path="customization-groups" element={<AdminCustomizationGroups />} />
          <Route path="add-on" element={<AdminAddon />} />
          <Route path="table" element={<AdminTableManagement />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="staff" element={<AdminStaffManagement />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="revenue" element={<AdminRevenueManagement />} />
        </Route>

        {/* ===== Waiter Dashboard Routes ===== */}
        <Route
          path="/WaiterDashboard"
          element={
            <ProtectedRoute allowedRoles={["WAITER"]}>
              <WaiterDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<WaiterHome />} />
          <Route path="home" element={<WaiterHome />} />
          <Route path="reservations" element={<WaiterReservation />} />
          <Route path="settings" element={<WaiterSettings />} />
          <Route path="profile" element={<WaiterProfile />} />
        </Route>

        {/* CHEF */}
        <Route path="/chefDashboard"
          element={
            <ProtectedRoute allowedRoles={["CHEF"]}>
              <ChefDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<ChefHomePage />} />
          <Route path="homepage" element={<ChefHomePage />} />
          <Route path="chefDashboard" element={<ChefDashboard />} />
          <Route path="menu" element={<ChefMenuCatalog />} />
          <Route path="OrdersQueue" element={<OrderQueue />} />
          <Route path="profile" element={<ChefProfile />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>


        {/* Customer Flow */}
        <Route path='/customerLogin' element={<CustomerLogin />} />
        <Route path='/enterSessionId' element={<EnterSessionId/>}/>
        <Route path='/otpVerification' element={<OTPVerification />} />
        <Route path='/customerDashboard' element={<CustomerDashboard />} />
        <Route path="/cart" element={<CustomerCart />} />

        {/* ===== Catch-all 404 ===== */}
        <Route path="*" element={<h2 className="text-center mt-10">404 - Page Not Found</h2>} />
      </Routes>
      <ToastContainer position="top-center" autoClose={2000} />
      <Footer />
    </>
  );
}

export default App;
