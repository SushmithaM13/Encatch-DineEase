import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

const getInitialState = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isGuest = localStorage.getItem("isGuest") === "true";
  const customerData = JSON.parse(localStorage.getItem("customerData") || "null");
  return { isLoggedIn, isGuest, customer: customerData };
};

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(getInitialState());

  const login = (customerData) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("isGuest", "false");
    localStorage.setItem("customerData", JSON.stringify(customerData));
    setAuthState({ isLoggedIn: true, isGuest: false, customer: customerData });
    console.log("User logged in:", customerData);
  };

  const loginAsGuest = () => {
    localStorage.setItem("isLoggedIn", "false");
    localStorage.setItem("isGuest", "true");
    localStorage.removeItem("customerData");
    setAuthState({ isLoggedIn: false, isGuest: true, customer: null });
    console.log("Guest login");
  };

  const logout = () => {
    localStorage.clear();
    setAuthState({ isLoggedIn: false, isGuest: false, customer: null });
  };

  useEffect(() => {
    const syncAuth = () => setAuthState(getInitialState());
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  return (
    <AuthContext.Provider value={{
      ...authState,
      login, loginAsGuest, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
