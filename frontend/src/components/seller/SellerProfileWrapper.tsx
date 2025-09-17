import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSellerProfile } from "../../api/seller";
import SellerProfile from "../../pages/Seller/Profile";

/**
 * Wrapper component that handles self-profile detection and redirection
 * When a seller accesses /seller (their own profile), redirect to /sellers/{slug}
 */
const SellerProfileWrapper: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSelfProfileRedirect = async () => {
      // If we already have a slug, we're viewing a public profile
      if (slug) {
        setLoading(false);
        return;
      }

      try {
        // Check if user is authenticated seller and get their slug
        const token = localStorage.getItem("token");
        if (!token) {
          // Not authenticated, redirect to login
          navigate("/login");
          return;
        }

        // Get current seller's profile to get their slug
        const sellerData = await fetchSellerProfile();
        if (sellerData.slug) {
          // Redirect to slug-based URL
          navigate(`/sellers/${sellerData.slug}`, { replace: true });
        } else {
          // Seller doesn't have a slug, show error
          console.error("Seller profile missing slug");
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load seller profile:", error);
        // If profile fetch fails, user might not be a seller
        navigate("/login");
      }
    };

    handleSelfProfileRedirect();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render the actual profile component
  return <SellerProfile />;
};

export default SellerProfileWrapper;
