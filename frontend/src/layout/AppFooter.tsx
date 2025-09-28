import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type FooterLinkTarget =
  | string
  | {
      pathname?: string;
      hash?: string;
      search?: string;
    };

const AppFooter = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribing email:", email);
  };

  const resolveHref = (to: FooterLinkTarget) => {
    if (typeof to === "string") return to;
    const pathname = to.pathname ?? "";
    const search = to.search ?? "";
    const hash = to.hash ?? "";
    return `${pathname}${search}${hash}` || "#";
  };

  const handleNavigate = (to: FooterLinkTarget) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate(to);
  };

  return (
    <footer className="w-full bg-[#434343] text-white">

      

      <div className="py-18 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-light mb-8 text-white">
            Subscribe to Stay Updated About Discounts
          </h2>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="email"
                placeholder="nexora@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-[#343434] border border-[#666666] rounded-full placeholder-[#818080] focus:outline-none focus:border-[#999999] hover:border-[#888888] transition-colors"



              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-[#282828] rounded-full transition-colors hover:bg-[#3a3a3a]"
                aria-label="Subscribe"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>


        <div className="max-w-7xl mx-auto px-8 pt-12 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                title: "Products",
                links: [
                  { label: "For Home & Kitchen", to: "/search?category=Home%20%26%20Kitchen" },
                  { label: "Electronics", to: "/search?category=electronics" },
                ],
              },
              {
                title: "Legal Pages",
                links: [
                  { label: "Privacy Policy", to: "/privacy-policy" },
                  { label: "Terms & Conditions", to: "/terms" },
                  { label: "Refund Policy", to: "/refund-policy" },
                  { label: "Shipping Info", to: "/shipping-info" },
                  { label: "Contact Us", to: "/contact" },
                ],
              },
              {
                title: "SUPPORT",
                links: [
                  { label: "FAQ", to: { pathname: "/", hash: "#support" } },
                  { label: "Customer Service", to: { pathname: "/", hash: "#support" } },
                  { label: "Returns & Exchanges", to: { pathname: "/", hash: "#support" } },
                  { label: "Warranty", to: { pathname: "/", hash: "#support" } },
                ],
              },
              {
                title: "ABOUT",
                links: [
                  { label: "Our Story", to: { pathname: "/", hash: "#support" } },
                  { label: "Sustainability", to: { pathname: "/", hash: "#support" } },
                  { label: "Careers", to: { pathname: "/", hash: "#support" } },
                  { label: "Blog", to: { pathname: "/", hash: "#support" } },
                  { label: "Partnerships", to: { pathname: "/", hash: "#support" } },
                ],
              },
            ].map(({ title, links }, idx) => (
              <div key={idx}>
                <h3
                  className="text-base font-medium uppercase tracking-wider mb-6"
                  style={{ color: "#777777" }}
                >
                  {title}
                </h3>
                <ul className="space-y-3">
                  {links.map(({ label, to }, i) => (
                    <li key={i}>
                      <a
                        href={resolveHref(to)}
                        className="text-base text-white hover:text-[#888888] transition-colors duration-200"
                        onClick={handleNavigate(to)}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      <div className="border-t border-[#999999] py-6 max-w-7xl mx-auto px-8">
        <div className="text-center max-w-7xl mx-auto px-8">
          <p className="text-xs text-white ">Copyright © 2025 Nexora, Inc</p>
        </div>
      </div>
      <div className="h-18" />
    </footer>
  );
};

export default AppFooter;
