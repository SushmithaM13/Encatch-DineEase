import { Routes, Route, } from 'react-router-dom';
import './App.css';
import Login from './components/Auth/login';
import SuperAdminDashboard from './pages/superadmin/dashboard/superAdminDashboard';
import AdminDashboard from './pages/adminDashboard';
import StaffDashboard from './pages/staffDashboard';
import ProtectedRoute from './components/Auth/protectedRoute';
import ForgotPassword from './components/Auth/forgotPassword';
import ResetPassword from './components/Auth/resetPassword';
import SuperAdminRegistration from './components/signup/SuperAdminRegistration';
import UserManagement from "./pages/superadmin/usermanagement/UserManagement";
import Items from "./pages/superadmin/items/FoodItems";
import TableManagement from "./pages/superadmin/tablemanagemnet/TableManagement";

import SuperAdminHome from "./pages/superadmin/dashboard/SuperAdminHome";


import AddStaffRole  from './pages/superadmin/staffroles/AddStaffRole'; 
// import Settings from "./pages/superadmin/Settings";
// import Logout from "./pages/superadmin/Logout";

import Footer from './components/footer/Footer';

function App() {
  
  return (
    <>
   
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/forgotPassword' element={<ForgotPassword/>}/>
      <Route path='/resetPassword' element={<ResetPassword/>}/>
      <Route path='/SuperAdminRegistration' element={<SuperAdminRegistration/>}/>
      
      {/* Private Routes */}
      <Route path='superAdminDashboard/*' element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><SuperAdminDashboard/></ProtectedRoute>}>
        <Route index element={<SuperAdminHome />} />
        <Route path="staff" element={<UserManagement />} />
        <Route path="food-items" element={<Items />} />
        <Route path="staffrole" element={<AddStaffRole />} />
        <Route path="table" element={<TableManagement />} />


        {/* <Route path="settings" element={<Settings />} />
        <Route path="logout" element={<Logout />} /> */}
      </Route>
      <Route path='adminDashboard' element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard/></ProtectedRoute>}/>
      <Route path='staffDashboard' element={<ProtectedRoute allowedRoles={["STAFF"]}><StaffDashboard/></ProtectedRoute>}/>

    </Routes>
    <Footer/>
    </>
  );

}

export default App;
