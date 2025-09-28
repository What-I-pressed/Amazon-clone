import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getVerificationStatus, sendVerificationEmail } from "../../services/authService";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const VerifyPending: React.FC = () => {
  const query = useQuery();
  const emailParam = query.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<"idle" | "checking" | "sent" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [verified, setVerified] = useState(false);
  const [counter, setCounter] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: any;
    if (email) {
      setStatus("checking");
      const poll = async () => {
        try {
          const res = await getVerificationStatus(email);
          const { verified } = res.data;
          if (verified) {
            setVerified(true);
            // small delay then redirect to login
            setTimeout(() => navigate("/login"), 1200);
            return; // stop polling
          }
        } catch (e: any) {
          // swallow polling errors but expose once
          setError(e.response?.data || e.message || "Failed to check status");
        }
        timer = setTimeout(poll, 3000);
      };
      poll();
    }
    return () => clearTimeout(timer);
  }, [email, navigate]);

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email to resend.");
      return;
    }
    try {
      await sendVerificationEmail(email);
      setStatus("sent");
      setError("");
      setCounter((c) => c + 1);
    } catch (e: any) {
      setStatus("error");
      setError(e.response?.data || e.message || "Failed to send verification email");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md bg-white border border-[#e7e7e7] rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#2a2a2a] mb-2">Verify your email</h1>
        <p className="text-[#585858] mb-6">
          We sent a verification link to your email. Please click the link to activate your account.
        </p>

        {verified ? (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            Email verified! Redirecting to sign in...
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
            )}

            <label className="block text-sm font-medium text-[#454545] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[50px] px-4 border border-[#dadada] rounded-full focus:outline-none focus:ring-2 focus:ring-[#42A275] focus:border-transparent mb-4"
              placeholder="Enter your email"
            />
            <button
              onClick={handleResend}
              className="w-full h-[50px] bg-[#42A275] text-white rounded-full hover:bg-green-700 transition-all mb-3"
            >
              Resend verification email
            </button>
            <div className="text-sm text-[#838383] mb-1">{status === "sent" && `Email sent${counter > 1 ? ` (${counter})` : ""}.`}</div>

            <div className="text-sm text-[#585858]">
              Already verified? <Link to="/login" className="text-[#42A275] hover:underline">Sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyPending;
