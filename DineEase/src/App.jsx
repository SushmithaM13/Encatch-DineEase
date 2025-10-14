import { Routes, Route } from "react-router-dom";
import "./App.css";

// ===== Auth Pages =====
import Login from "./components/Auth/login";
import ForgotPassword from "./components/Auth/forgotPassword";
import ResetPassword from "./components/Auth/resetPassword";
import SuperAdminRegistration from "./components/signup/SuperAdminRegistration";
import ProtectedRoute from "./components/Auth/protectedRoute";

// ===== SuperAdmin Pages =====
import SuperAdminDashboard from "./pages/superadmin/dashboard/superAdminDashboard";

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
import Reservation from "./pages/Waiter/Reservation/Reservation";

// ===== Chef Pages =====
import ChefHome from "./pages/Chef/ChefHome/ChefHome";
import ChefHomePage from "./pages/Chef/ChefHomepage/ChefHomepage";
import ChefDashboard from "./pages/Chef/ChefDashboard/ChefDashboard";
import ChefMenuCatalog from "./pages/Chef/ChefMenuCatalog/ChefMenuCatalog";
import Inventory from "./pages/Chef/Inventory/Inventory";
import OrderQueue from "./pages/Chef/OrderQueue/OrderQueue";

// ===== Footer =====
import Footer from "./components/footer/Footer";

function App() {
  return (
    <>
      <Routes>
        {/* ===== Public Routes ===== */}
        <Route path="/" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/SuperAdminRegistration" element={<SuperAdminRegistration />} />

        {/* ===== Super Admin Dashboard ===== */}
        <Route
          path="/superAdminDashboard"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ===== Admin Dashboard ===== */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="table" element={<AdminTableManagement />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="staff" element={<AdminStaffManagement />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="revenue" element={<AdminRevenueManagement />} />
        </Route>

        {/* ===== Waiter Dashboard ===== */}
        <Route
          path="/waiter-dashboard"
          element={
            <ProtectedRoute allowedRoles={["WAITER"]}>
              <WaiterDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<WaiterHome />} />
          <Route path="reservations" element={<Reservation />} />
        </Route>

        {/* ===== Chef Layout ===== */}
        <Route
          path="/chefDashboard"
          element={
            // <ProtectedRoute allowedRoles={["CHEF"]}>
              <ChefHome />
            // </ProtectedRoute>
          }
        >
          <Route index element={<ChefHomePage />} /> {/* Default = Home */}
          <Route path="ChefDashboard" element={<ChefDashboard />} /> {/* Dashboard */}
          <Route path="OrdersQueue" element={<OrderQueue />} />
          <Route path="menu" element={<ChefMenuCatalog />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>

        {/* ===== 404 ===== */}
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
