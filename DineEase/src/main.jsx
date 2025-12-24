import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AuthProvider from './context/AuthContext.jsx';
// import { CustomerProvider } from './context/CustomerContext.jsx';
import { SessionProvider } from "./context/SessionContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
          <SessionProvider>
            <App/>
          </SessionProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
