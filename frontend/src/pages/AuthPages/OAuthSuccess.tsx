import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function OAuthSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (!auth) return;
    const { loginUser } = auth;

    const searchParams = new URLSearchParams(location.search);
    let token = searchParams.get("token");

    // Fallback: sometimes providers put data in the hash
    if (!token && location.hash) {
      const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));
      token = hashParams.get("token") || undefined as unknown as string;
    }

    if (token) {
      (async () => {
        await loginUser(token!);
        navigate("/", { replace: true });
      })();
    } else {
      // No token provided, redirect to login
      navigate("/login");
    }
  }, [auth, location.search, location.hash, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-[#454545]">Signing you in with Google...</div>
    </div>
  );
}
