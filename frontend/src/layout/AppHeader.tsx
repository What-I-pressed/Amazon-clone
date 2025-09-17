import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/ui/avatar/logo.svg";
import { AuthContext } from "../context/AuthContext";
import { fetchSellerProfile } from "../api/seller";
import type { Seller } from "../types/seller";
import CategoryDropdown from "../components/CategoryDropdown";

const Navbar: React.FC = () => {
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [accountDropdown, setAccountDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const languageRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const auth = useContext(AuthContext);
  if (!auth) throw new Error("Navbar must be used within AuthProvider");
  const { user, logoutUser } = auth;

  const [seller, setSeller] = useState<Seller | null>(null);

  useEffect(() => {
    const loadSeller = async () => {
      if (!user) {
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
    if (searchTerm.trim()) {
      navigate(`/search?query=${searchTerm.trim()}`);
    }
  };

  return (
    <nav style={{ backgroundColor: "#434343" }} className="text-white py-4 relative">
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
          <div className="flex rounded-full overflow-visible max-w-md mx-auto h-10 relative" style={{ backgroundColor: "#A2A2A2" }}>
            {/* Category dropdown */}
            <CategoryDropdown
              onSelect={(category) => {
                setSelectedCategory(category);
                console.log("Selected category:", category);
              }}
            />

            {/* Search input */}
            <input
              className="w-full px-3 text-white bg-transparent focus:outline-none placeholder-white text-sm hover:placeholder-gray-300 transition-colors duration-500 ease-in-out"
              placeholder="Nexora Search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />

            {/* Search button */}
            <button
              className="px-3 py-2 rounded-md flex items-center justify-center transition-colors duration-300 ease-in-out hover:bg-[#343434] group focus:outline-none"
              style={{ backgroundColor: "#757575" }}
              aria-label="Search"
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
          {/* Language dropdown */}
          <div className="relative" ref={languageRef}>
            <div
              className="flex items-center cursor-pointer text-base transition-colors duration-300 ease-in-out hover:text-gray-300 group"
              onClick={() => setLanguageDropdown(prev => !prev)}
            >
              <span className="group-hover:text-gray-300 transition-colors duration-300 ease-in-out">EN</span>
              <span className="material-icons group-hover:text-gray-300 transition-colors duration-300 ease-in-out" style={{ lineHeight: 1, marginLeft: -2, color: "#b0b0b0" }}>
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

          {/* Account dropdown */}
          <div className="relative" ref={accountRef}>
            <div
              className="cursor-pointer text-center text-sm transition-colors duration-300 ease-in-out hover:text-gray-300 px-2 py-1 rounded hover:bg-[#343434]"
              onClick={() => setAccountDropdown(prev => !prev)}
            >
              <div className="flex items-center justify-center gap-2">
                {seller?.url ? (
                  <img src={seller.url} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                ) : null}
                <span>
                  {user ? `Hello, ${seller?.username || user.username || user.email}` : "Hello, sign in"}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span>Account</span>
                <span className="material-icons" style={{ lineHeight: 1 }}>arrow_drop_down</span>
              </div>
            </div>

            <div
              className={`absolute top-full right-0 mt-1 w-32 rounded-md shadow-lg z-50 overflow-hidden transition-all duration-300 ease-out transform ${accountDropdown ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
              style={{ backgroundColor: "#757575" }}
            >
              <div className="py-1">
                {user ? (
                  <>
                    <button className="block w-full text-center px-4 py-2 text-sm text-white hover:bg-[#343434]" onClick={() => window.location.href = "/seller"}>
                      Seller Profile
                    </button>
                    <button className="block w-full text-center px-4 py-2 text-sm text-white hover:bg-[#343434]" onClick={() => window.location.href = "/seller/dashboard"}>
                      Seller Dashboard
                    </button>
                    <button className="block w-full text-center px-4 py-2 text-sm text-white hover:bg-[#343434]" onClick={() => window.location.href = "/seller/edit"}>
                      Edit Seller
                    </button>
                    <div className="h-px bg-[#6a6a6a] my-1" />
                    <button className="block w-full text-center px-4 py-2 text-sm text-white hover:bg-[#343434]" onClick={() => window.location.href = "/profile"}>
                      Account Profile
                    </button>
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

          {/* Cart */}
          <div className="cursor-pointer text-sm transition-colors duration-300 ease-in-out hover:text-gray-300 px-2 py-1 rounded hover:bg-[#343434]">
            Cart
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
