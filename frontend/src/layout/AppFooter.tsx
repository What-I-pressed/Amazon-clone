import React, { useState } from "react";

const AppFooter = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribing email:", email);
  };

  return (
    <footer className="w-full bg-[#434343] text-white">

      <div className="border-b border-gray-700 py-12 bg-[#666666]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center overflow-x-auto whitespace-nowrap text-[#434343] text-xs uppercase font-semibold tracking-wider">
            <span className="mr-8">She Finds</span>
            <span className="mx-8">yahoo!</span>
            <span className="mx-8 italic">healthline</span>
            <span className="mx-8">yahoo!</span>
            <span className="mx-8">yahoo!</span>
            <span className="mx-8">msn</span>
            <span className="mx-8">yahoo!</span>
          </div>
        </div>
      </div>

      <div className="py-18 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-light mb-2 text-white">
            Subscribe To Your Newsletter To Stay Updated
          </h2>
          <p className="text-2xl font-light mb-8 text-white">About Discounts</p>

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


        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              {
                title: "Products",
                links: [
                  "Lorem Ipsum",
                  "Lorem Ipsum",
                  "Lorem Ipsum",
                ],
              },
              {
                title: "Legal Pages",
                links: [
                  "Lorem Ipsum Text",
                  "Lorem Ipsum Text",
                  "Lorem Ipsum Text",
                  "Lorem Ipsum",
                  "Lorem Ipsum",
                ],
              },
              {
                title: "Products",
                links: [
                  "Lorem Ipsum",
                  "Lorem Ipsum",
                  "Lorem Ipsum",
                  "Lorem Ipsum",
                  "Lorem Ipsum",
                ],
              },
              {
                title: "Products",
                links: [
                  "Lorem Ipsum",
                  "Lorem Ipsum",
                  "Lorem Ipsum",
                  "Lorem Ipsum",
                  "Lorem Ipsum",
                ],
              },
              {
                title: "Legal Pages",
                links: [
                  "Lorem Ipsum Text",
                  "Lorem Ipsum Text",
                  "Lorem Ipsum Text",
                  "Lorem Ipsum",
                  "Lorem Ipsum",
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
                  {links.map((link, i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className="text-base text-white hover:text-[#888888] transition-colors duration-200"
                      >
                        {link}
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
