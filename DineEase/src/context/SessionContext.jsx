// SessionContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId") || null);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId") || null);
  const [tableId, setTableId] = useState(localStorage.getItem("tableId") || null);

  useEffect(() => {
    if (sessionId === null) localStorage.removeItem("sessionId");
    else localStorage.setItem("sessionId", sessionId);

    if (orgId === null) localStorage.removeItem("orgId");
    else localStorage.setItem("orgId", orgId);

    if (tableId === null) localStorage.removeItem("tableId");
    else localStorage.setItem("tableId", tableId);
  }, [sessionId, orgId, tableId]);

  const clearSession = () => {
    setSessionId(null);
    setOrgId(null);
    setTableId(null);
  };

  return (
    <SessionContext.Provider value={{ sessionId, setSessionId, orgId, setOrgId, tableId, setTableId, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
