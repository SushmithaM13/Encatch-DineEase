import { createContext, useContext, useState, useEffect } from "react";

// ✅ Create Context
const CustomerContext = createContext();

// ✅ Custom Hook (for easy use)
export const useCustomer = () => useContext(CustomerContext);

// ✅ Provider Component
export const CustomerProvider = ({ children }) => {
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId") || null);
  const [tableId, setTableId] = useState(localStorage.getItem("tableId") || null);
  const [customer, setCustomer] = useState(null);

  // ✅ Persist orgId & tableId in localStorage
  useEffect(() => {
    if (orgId) localStorage.setItem("orgId", orgId);
    if (tableId) localStorage.setItem("tableId", tableId);
  }, [orgId, tableId]);

  const clearCustomerData = () => {
    setOrgId(null);
    setTableId(null);
    setCustomer(null);
    localStorage.removeItem("orgId");
    localStorage.removeItem("tableId");
  };

  return (
    <CustomerContext.Provider
      value={{ orgId, setOrgId, tableId, setTableId, customer, setCustomer, clearCustomerData }}
    >
      {children}
    </CustomerContext.Provider>
  );
};
