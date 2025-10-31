import { Routes, Route } from "react-router-dom";
import "./App.css";

// ===== Auth Pages =====
import Login from "./components/Auth/login";
import ForgotPassword from "./components/Auth/forgotPassword";
import ProtectedRoute from "./components/Auth/protectedRoute";
import ResetPassword from "./components/Auth/resetPassword";
import SuperAdminRegistration from "./components/signup/SuperAdminRegistration";

// ===== Super Admin Pages =====
import SuperAdminDashboard from "./pages/superadmin/dashboard/superAdminDashboard";
import UserManagement from "./pages/superadmin/usermanagement/UserManagement";
import Items from "./pages/superadmin/items/FoodItems";
import SuperAdminHome from "./pages/superadmin/dashboard/SuperAdminHome";
import TableManagement from "./pages/superadmin/tablemanagemnet/TableManagement";
import AddStaffRole from "./pages/superadmin/staffroles/AddStaffRole";

// ===== Admin Pages =====
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import AdminHome from "./pages/Admin/Home/AdminHome";
import AdminProfile from "./pages/Admin/Profile/AdminProfile";
import AdminTableManagement from "./pages/Admin/table/AdminTableManagement";
import RoleManagement from "./pages/Admin/Role/RoleManagement";
import AdminStaffManagement from "./pages/Admin/Staff/AdminStaffManagement";
import AdminSettings from "./pages/Admin/Settings/AdminSettings";
import AdminRevenueManagement from "./pages/Admin/Revenue/AdminRevenueManagement";

// ===== Admin Menu Management Pages =====
import AdminMenu from "./pages/Admin/Menu/Manage Menus/AdminMenu";
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

import Footer from "./components/footer/Footer";

function App() {
  return (
    <>
      <Routes>
        {/* ===== Auth Routes ===== */}
        <Route path="/" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/SuperAdminRegistration" element={<SuperAdminRegistration />} />

        {/* ===== Super Admin Routes ===== */}
        <Route
          path="superAdminDashboard/*"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperAdminHome />} />
          <Route path="staff" element={<UserManagement />} />
          <Route path="food-items" element={<Items />} />
          <Route path="staffrole" element={<AddStaffRole />} />
          <Route path="table" element={<TableManagement />} />
        </Route>

        {/* ===== Admin Dashboard Routes ===== */}
        <Route
          path="/AdminDashboard"
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

        {/* ===== 404 Page ===== */}
        <Route
          path="*"
          element={<h2 className="text-center mt-10">404 - Page Not Found</h2>}
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
