import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import { validateSessionId } from "../api/customerTableAPI";
import { toast } from "react-toastify";

const EnterSessionId = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const orgId = location.state?.orgId || params.get("organization");

  const { setSessionId } = useSession();

  const handleSubmit = async () => {
    if (!code.trim()) return toast.error("Please enter session code");

    try {
      const { ok } = await validateSessionId(orgId, code);

      if (!ok) {
        toast.error("Invalid session id for this table");
        return;
      }

      setSessionId(code);
      navigate("/customerDashboard");

    } catch (err) {
      console.error(err);
      toast.error("Invalid code. Please try again.");
    }
  };

  return (
    <div>
      <h2>Enter Session Code</h2>
      <input value={code} onChange={(e) => setCode(e.target.value)} />
      <button onClick={handleSubmit}>Continue</button>
    </div>
  );
};

export default EnterSessionId;
