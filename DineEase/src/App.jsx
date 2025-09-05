import { Routes, Route, } from 'react-router-dom'
import './App.css'
import Login from './components/Auth/login'
import SuperAdminDashboard from './pages/superAdminDashboard'
import AdminDashboard from './pages/adminDashboard'
import StaffDashboard from './pages/staffDashboard'
import ProtectedRoute from './components/Auth/protectedRoute'
import ForgotPassword from './components/Auth/forgotPassword'
import ResetPassword from './components/Auth/resetPassword'
import Footer from "./components/footer/Footer"
import SuperAdminRegistration from './components/signup/SuperAdminRegistration'


function App() {
  
  return (
    <>
    <SuperAdminRegistration/>
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/forgotPassword' element={<ForgotPassword/>}/>
      <Route path='/resetPassword' element={<ResetPassword/>}/>
      
      {/* Privat Route */}
      <Route path='superAdminDashboard' element={<ProtectedRoute allowedRoles={["superAdmin"]}><SuperAdminDashboard/></ProtectedRoute>}/>
      <Route path='adminDashboard' element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard/></ProtectedRoute>}/>
      <Route path='staffDashboard' element={<ProtectedRoute allowedRoles={["staff"]}><StaffDashboard/></ProtectedRoute>}/>
    </Routes>
    <Footer/>
    </>
  );

}

export default App;
