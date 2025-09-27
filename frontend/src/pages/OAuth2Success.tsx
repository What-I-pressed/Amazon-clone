import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function OAuth2Success() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let token = params.get("token") || params.get("jwt");

    // Some setups may pass data in the hash fragment
    if (!token && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      token = hashParams.get("token") || hashParams.get("jwt");
    }

    if (token) {
      localStorage.setItem("token", token);
    }

    // Always send user to home in this flow
    navigate("/");
  }, [navigate]);

  return <p>Redirecting...</p>;
}

export default OAuth2Success;
