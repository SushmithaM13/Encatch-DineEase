import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// ===== Auth Pages =====
import Login from './components/Auth/login';
import ForgotPassword from './components/Auth/forgotPassword';
import ProtectedRoute from './components/Auth/protectedRoute';
import ResetPassword from './components/Auth/resetPassword';
import SuperAdminRegistration from './components/signup/SuperAdminRegistration';

// ===== Super Admin Pages =====
import SuperAdminDashboard from './pages/superadmin/dashboard/superAdminDashboard';
import UserManagement from "./pages/superadmin/usermanagement/UserManagement";
import Items from "./pages/superadmin/items/FoodItems";
import SuperAdminHome from "./pages/superadmin/dashboard/SuperAdminHome";
import TableManagement from "./pages/superadmin/tablemanagemnet/TableManagement";
import AddStaffRole from './pages/superadmin/staffroles/AddStaffRole';

// ===== Admin Pages =====
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import AdminHome from "./pages/Admin/Home/AdminHome";
import AdminProfile from "./pages/Admin/Profile/AdminProfile";
import AdminMenu from "./pages/Admin/Menu/AdminMenu";
import AdminTableManagement from "./pages/Admin/Table/AdminTableManagement";
import RoleManagement from "./pages/Admin/Role/RoleManagement";
import AdminStaffManagement from "./pages/Admin/Staff/AdminStaffManagement";
import AdminSettings from "./pages/Admin/Settings/AdminSettings";
import AdminRevenueManagement from "./pages/Admin/Revenue/AdminRevenueManagement";

// ===== Waiter Pages =====
import WaiterDashboard from "./pages/Waiter/WaiterDashboard/WaiterDashboard";
import WaiterHome from "./pages/Waiter/Home/WaiterHome";
import WaiterReservation from "./pages/Waiter/WaiterReservation/WaiterReservation";
import WaiterSettings from "./pages/Admin/Settings/AdminSettings";
import WaiterProfile from "./pages/Waiter/Profile/WaiterProfile";

// ===== Chef Pages =====
import ChefHome from "./pages/Chef/ChefHome/ChefHome";
import ChefHomePage from "./pages/Chef/ChefHomepage/ChefHomepage";
import ChefDashboard from "./pages/Chef/ChefDashboard/ChefDashboard";
import ChefMenuCatalog from './pages/Chef/ChefMenuCatalog/ChefMenuCatalog';
import OrderQueue from "./pages/Chef/OrderQueue/OrderQueue";
import Inventory from "./pages/Chef/Inventory/Inventory";
import ChefProfile from "./pages/Chef/Profile/ChefProfile";

import Footer from './components/footer/Footer';

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
    } catch (e) {}
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/SuperAdminRegistration" element={<SuperAdminRegistration />} />

        {/* SUPER ADMIN */}
        <Route path="/superAdminDashboard/*"
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
          <Route path="table" element={<AdminTableManagement />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="staff" element={<AdminStaffManagement />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="revenue" element={<AdminRevenueManagement />} />
        </Route>

        {/* WAITER */}
        <Route path="/WaiterDashboard"
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
              <ChefHome />
            </ProtectedRoute>
          }
        >
          <Route index element={<ChefHomePage />} />
          <Route path="home" element={<ChefHomePage />} />
          <Route path="chefDashboard" element={<ChefDashboard />} />
          <Route path="menu" element={<ChefMenuCatalog />} />
          <Route path="OrdersQueue" element={<OrderQueue />} />
          <Route path="profile" element={<ChefProfile />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>

        <Route path="*" element={<h2 className="text-center mt-10">404 - Page Not Found</h2>} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
