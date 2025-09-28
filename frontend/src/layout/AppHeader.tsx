import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../components/ui/avatar/logo.svg";
import { AuthContext } from "../context/AuthContext";
import { fetchSellerProfile } from "../api/seller";
import type { Seller } from "../types/seller";
import CategoryDropdown from "../components/CategoryDropdown";
import { fetchCart } from "../api/cart";

const Navbar: React.FC = () => {
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [accountDropdown, setAccountDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);

  const languageRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const auth = useContext(AuthContext);
  if (!auth) throw new Error("Navbar must be used within AuthProvider");
  const { user, logoutUser } = auth;
  const role = String(user?.roleName ?? "").toUpperCase();
  const isSeller = role === "SELLER";
  const isAdmin = role === "ADMIN";

  const [seller, setSeller] = useState<Seller | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const loadSeller = async () => {
      if (!user || isAdmin) {
        setSeller(null);
        return;
      }
      try {
        const profile = await fetchSellerProfile();
        setSeller(profile);
      } catch (e) {
        setSeller(null);
      }
    };
    loadSeller();
  }, [user]);

  useEffect(() => {
    const loadCart = async () => {
      try {
        if (!user || isSeller || isAdmin) {
          setCartCount(0);
          return;
        }
        const items = await fetchCart();
        const count = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };
    // initial load and on user change
    loadCart();
    // listen for global cart updates
    const handleUpdated = () => loadCart();
    window.addEventListener('cart:updated', handleUpdated as EventListener);
    return () => window.removeEventListener('cart:updated', handleUpdated as EventListener);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setLanguageDropdown(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoClick = () => {
    window.location.href = "/";
  };

  const handleSearch = () => {
    const q = searchTerm.trim();
    if (!q) return;
    // Scope to the subcategory only if one is currently chosen in this header session
    const subId = selectedSubcategoryId;
    const base = `/search?query=${encodeURIComponent(q)}`;
    navigate(subId ? `${base}&subcategoryId=${subId}` : base);
  };

  return (
    <nav
    style={{
      backgroundColor: "rgba(42, 42, 42, 0.9)",
      backdropFilter: "blur(25px)",
      WebkitBackdropFilter: "blur(25px)"
    }}
      className="text-white py-4 relative sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-8 flex items-center gap-8">
        {/* Logo */}
        <div
          className="flex items-center flex-shrink-0 cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:brightness-110"
          title="Home"
          onClick={handleLogoClick}
        >
          <img src={Logo} alt="Logo" className="h-10 w-auto" />
        </div>

        {/* Search bar */}
        <div className="flex-grow ">
          <div className="flex rounded-md overflow-visible max-w-md mx-auto h-10 relative" style={{ backgroundColor: "#A2A2A2" }}>
            <CategoryDropdown
              onSelect={(category) => {
                setSelectedSubcategoryId(null);

                if (category === "All") {
                  const params = new URLSearchParams(location.search);
                  const q = params.get("query");
                  navigate(q ? `/search?query=${encodeURIComponent(q)}` : "/search");
                  return;
                }

                navigate(`/search?category=${encodeURIComponent(category)}`);
              }}
              onSubcategorySelect={(subcategory) => {
                // Redirect to search page filtered by selected subcategory ID (backend supports subcategoryId)
                setSelectedSubcategoryId(subcategory.id);
                navigate(`/search?subcategoryId=${subcategory.id}`);
              }}
            />

            <input
              className="w-full px-3 text-white bg-transparent focus:outline-none placeholder-white text-sm hover:placeholder-[#dadada] transition-colors duration-500 ease-in-out"
              placeholder="Nexora Search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />

            <button
              className="px-3 py-2 rounded-md flex items-center justify-center transition-colors duration-300 ease-in-out hover:bg-[#343434] group focus:outline-none"
              style={{ backgroundColor: "#757575" }}
              onClick={handleSearch}
            >
              <span className="material-icons font-normal text-sm text-black group-hover:text-white transition-colors duration-300 ease-in-out">
                search
              </span>
            </button>
          </div>
        </div>

        {/* Right block */}
        <div className="flex items-center gap-16 flex-shrink-0">
          {isSeller && (
            <>
              <div
                className="cursor-pointer text-sm transition-colors duration-300 ease-in-out hover:text-[#dadada] px-2 py-1 rounded"
                onClick={() => navigate("/seller/dashboard")}
                title="Go to seller dashboard"
              >
                Seller Dashboard
              </div>
              <div
                className="cursor-pointer text-sm transition-colors duration-300 ease-in-out hover:text-[#dadada] px-2 py-1 rounded"
                onClick={() => navigate("/seller/orders")}
                title="Go to seller orders"
              >
                Orders
              </div>
            </>
          )}

          {isAdmin && (
            <div
              className="cursor-pointer text-sm transition-colors duration-300 ease-in-out hover:text-[#dadada] px-2 py-1 rounded"
              onClick={() => navigate("/admin")}
              title="Go to admin dashboard"
            >
              Admin Dashboard
            </div>
          )}

          {/* Language dropdown */}
          <div className="relative" ref={languageRef}>
            <div
              className="flex items-center cursor-pointer text-base transition-colors duration-300 ease-in-out hover:text-[#dadada] group"
              onClick={() => setLanguageDropdown(prev => !prev)}
            >
              <span className="group-hover:text-[#dadada] transition-colors duration-300 ease-in-out">EN</span>
              <span className="material-icons group-hover:text-[#dadada] transition-colors duration-300 ease-in-out" style={{ lineHeight: 1, marginLeft: -2, color: "#b0b0b0" }}>
                arrow_drop_down
              </span>
            </div>
            <div
              className={`absolute top-full right-0 mt-1 w-20 rounded-md shadow-lg z-50 overflow-hidden transition-all duration-300 ease-out transform ${languageDropdown ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
              style={{ backgroundColor: "#757575" }}
            >
              <div className="py-1">
                {["EN", "UA"].map(lang => (
                  <button
                    key={lang}
                    className="block w-full text-center px-3 py-2 text-sm text-white hover:bg-[#343434] transition-colors duration-200 ease-out focus:outline-none"
                    onClick={() => setLanguageDropdown(false)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Favourites */}
          {!isSeller && !isAdmin && (
            <div
              className="cursor-pointer text-sm transition-colors duration-300 ease-in-out hover:text-[#dadada] px-2 py-1 rounded"
              onClick={() => navigate("/favourites")}
              title="Go to favourites"
            >
              Favorites
            </div>
          )}

          {/* Orders */}
          {!isSeller && !isAdmin && (
            <div
              className="cursor-pointer text-sm transition-colors duration-300 ease-in-out hover:text-[#dadada] px-2 py-1 rounded"
              onClick={() => navigate("/orders")}
              title="Go to orders"
            >
              Orders
            </div>
          )}

          {/* Cart */}
          {!isSeller && !isAdmin && (
            <div
              className="relative cursor-pointer text-sm transition-colors duration-300 ease-in-out hover:text-[#dadada] px-2 py-1 rounded"
              onClick={() => navigate("/cart")}
              title="Go to cart"
            >
              Cart
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center"
                  aria-label={`Items in cart: ${cartCount}`}
                >
                  {cartCount}
                </span>
              )}
            </div>
          )}

          {/* Account dropdown */}
          <div className="relative" ref={accountRef}>
            <div
              className="cursor-pointer text-center text-sm transition-colors duration-300 ease-in-out hover:text-[#dadada] px-2 py-1 rounded"
              onClick={() => setAccountDropdown(prev => !prev)}
            >
              <div className="flex items-center justify-center gap-1">
                <span>
                  {user ? `Hello, ${seller?.username || user.username || user.email}` : "Hello, sign in"}
                </span>
                <span className="material-icons" style={{ lineHeight: 1 }}>arrow_drop_down</span>
              </div>
            </div>

            <div
              className={`absolute top-full rounded-md right-0 mt-1 w-32  shadow-lg z-50 overflow-hidden transition-all duration-300 ease-out transform ${accountDropdown ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
              style={{ backgroundColor: "#757575" }}
            >
              <div className="py-1">
                {user ? (
                  <>
                    {isAdmin ? (
                      <>
                        <button
                          className="block w-full text-center px-4 py-2 text-sm font-semibold text-white hover:bg-[#343434]"
                          onClick={() => navigate("/admin")}
                        >
                          Admin Dashboard
                        </button>
                      </>
                    ) : seller ? (
                      <>
                        <button className="block w-full text-center px-4 py-2 text-sm text-white hover:bg-[#343434]" onClick={() => navigate(`/seller/${seller.slug}`)}>
                          Seller Profile
                        </button>
                        <button className="block w-full text-center px-4 py-2 text-sm font-semibold text-white hover:bg-[#343434]" onClick={() => navigate("/seller/dashboard")}>
                          Seller Dashboard
                        </button>
                        <button className="block w-full text-center px-4 py-2 text-sm text-white hover:bg-[#343434]" onClick={() => navigate("/seller/edit")}>
                          Edit Seller
                        </button>
                        <div className="h-px bg-[#6a6a6a] my-1" />
                      </>
                    ) : (
                      <>
                        <button className="block w-full text-center px-4 py-2 text-sm text-white hover:bg-[#343434]" onClick={() => navigate("/customer/dashboard")}>
                          Profile
                        </button>
                        <button className="block w-full text-center px-4 py-2 text-sm text-white hover:bg-[#343434]" onClick={() => navigate("/customer/edit")}>
                          Edit Profile
                        </button>
                      </>
                    )}
                    <button className="block w-full text-center px-4 py-2 text-sm text-white hover:bg-[#343434]" onClick={logoutUser}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button className="block w-full text-center px-4 py-2 text-sm text-white hover:bg-[#343434]" onClick={() => window.location.href = "/login"}>
                      Sign In
                    </button>
                    <button className="block w-full text-center px-4 py-2 text-sm text-white hover:bg-[#343434]" onClick={() => window.location.href = "/register"}>
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;