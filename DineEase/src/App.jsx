import { Routes, Route } from 'react-router-dom';
import './App.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ===== Auth Pages =====
import Login from './components/Auth/login';
import ForgotPassword from './components/Auth/forgotPassword';
import ResetPassword from './components/Auth/resetPassword';
import SuperAdminRegistration from './components/signup/SuperAdminRegistration';
import ProtectedRoute from './components/Auth/protectedRoute';

// ===== Dashboards =====
import SuperAdminDashboard from './pages/superadmin/dashboard/superAdminDashboard';
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

// ===== Footer =====
import Footer from './components/footer/Footer';

// ===== Customer pages =====
import CustomerLogin from './customer/customerLogin/customerLogin';
import OTPVerification from './customer/customerLogin/otpVerification';
import CustomerDashboard from './customer/customerDashboard/CustomerDashboard';
// import CustomerMenuPage from './customer/customerMenu/customerMenuPage';

function App() {
  return (
    <>
      <Routes>
        {/* ===== Public Routes ===== */}
        <Route path='/' element={<Login />} />
        <Route path='/forgotPassword' element={<ForgotPassword />} />
        <Route path='/resetPassword' element={<ResetPassword />} />
        <Route path='/SuperAdminRegistration' element={<SuperAdminRegistration />} />

        {/* ===== Super Admin Dashboard ===== */}
        <Route 
          path='/superAdminDashboard' 
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ===== Admin Dashboard Routes ===== */}
        <Route 
          path="/adminDashboard" 
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
          <Route path="reservations" element={<Reservation />} />
        </Route>


        {/* Customer Flow */}
        <Route path='/customerLogin/customer/login' element={<CustomerLogin/>}/>
        <Route path='/otpVerification' element={<OTPVerification/>}/>
        <Route path='/customerDashboard' element={<CustomerDashboard/>}/>
       

        {/* ===== Catch-all 404 ===== */}
        <Route path="*" element={<h2 className="text-center mt-10">404 - Page Not Found</h2>} />
      </Routes>
      <ToastContainer position="top-center" autoClose={2000} />
      <Footer />
    </>
  );
}

export default App;
