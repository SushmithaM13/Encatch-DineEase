import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './components/Auth/login';
import SuperAdminDashboard from './pages/superadmin/dashboard/superAdminDashboard';
import AdminDashboard from './pages/adminDashboard';
import StaffDashboard from './pages/staffDashboard';
import ProtectedRoute from './components/Auth/protectedRoute';
import ForgotPassword from './components/Auth/forgotPassword';
import ResetPassword from './components/Auth/resetPassword';
import SuperAdminRegistration from './components/signup/SuperAdminRegistration';
import Footer from './components/footer/Footer';
import ChefDashboard from './pages/Chef/Components/ChefDashboard/ChefDashboard.jsx'
import Inventory from './pages/Chef/Components/Inventory/Inventory';
import OrderQueue from './pages/Chef/Components/OrderQueue/OrderQueue';
import Sidebar from './pages/Chef/Components/Sidebar/Sidebar';
import Topbar from './pages/Chef/Components/Topbar/Topbar';
import ChefMenuCatlog from './pages/Chef/Components/ChefMenucatlog/ChefMenuCatalog.jsx';



function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/SuperAdminRegistration" element={<SuperAdminRegistration />} />

        {/* Private Routes */}
        <Route path="/superAdminDashboard"element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><SuperAdminDashboard /></ProtectedRoute>}/>
        <Route path="/adminDashboard"element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>}/>
        <Route path="/staffDashboard"element={<ProtectedRoute allowedRoles={["STAFF"]}><StaffDashboard /></ProtectedRoute>}/>

        {/* 👇 New Dashboard route */}
        <Route path="/ChefDashboard"element={<ChefDashboard />}/>
        <Route path='/ChefMenuCatalog' element={<ChefMenuCatlog />}/>
        <Route path='/inventory' element={<Inventory />}/>
        <Route path='/orderQueue' element={<OrderQueue />}/>
        <Route path='/sidebar' element={<Sidebar />}/>
        <Route path='/topbar' element={<Topbar />}/>  
                
                 
      </Routes>
      <Footer />
    </>
  );
}

export default App;
