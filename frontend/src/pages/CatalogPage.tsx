import React, { useState } from "react";
import ProductCard from "./ProductCard";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  discount?: number;
  image: string;
}

const CatalogPage: React.FC = () => {
  const [search, setSearch] = useState("");

  const products: Product[] = [
    { id: 1, name: "Desk Lamp with Adjustable Arm", category: "Furniture", price: 230, image: "/banner.png" },
    { id: 2, name: "Wall Art Canvas 100x60 cm", category: "Decor", price: 100, image: "/banner.png" },
    { id: 3, name: "Kitchen Bar Stool (set of 2)", category: "Kitchen", price: 140, discount: 15, image: "/banner.png" },
    { id: 4, name: "Minimalist Floor Lamp", category: "Furniture", price: 435, image: "/banner.png" },
    { id: 5, name: "Decorative Mirror 100x70 cm", category: "Decor", price: 1050, image: "/banner.png" },
  ];

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Верхній блок з пошуком */}
      <header className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">All Items</h1>
        <input
          type="text"
          placeholder="Search an item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xl border rounded-lg px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-gray-800"
        />
        <p className="text-gray-600 mt-2 text-sm">
          Showing {filteredProducts.length} of {products.length} item(s)
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="bg-white p-4 rounded-lg shadow-sm border space-y-6 h-fit">
          <div>
            <h3 className="font-semibold mb-3">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {["Furniture", "For Kitchen", "For Backyard", "Electronics"].map((cat) => (
                <li key={cat}>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-gray-800" /> {cat}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Price Range</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {["$20 – $50", "$50 – $200", "$200 – $500"].map((range) => (
                <li key={range}>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-gray-800" /> {range}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                imageUrl={product.image}
                title={product.name}
                price={`$${product.price}`}
                variant="grid"
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <button className="px-6 py-2 rounded-lg bg-gray-800 text-white hover:bg-black transition">
              Load More
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold mb-3">Subscribe To Our Newsletter</h4>
            <p className="text-sm text-gray-400">Stay updated about discounts</p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex">
              <input
                type="email"
                className="flex-1 border rounded-l-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-gray-800"
                placeholder="Email address"
              />
              <button
                type="submit"
                className="px-6 py-2 rounded-r-lg bg-gray-800 text-white hover:bg-black transition"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Products</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>For Home</li>
              <li>For Kitchen</li>
              <li>Electronics</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>Help Center</li>
              <li>Returns</li>
              <li>Warranty</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>About</li>
              <li>Careers</li>
              <li>Press</li>
            </ul>
          </div>
        </div>
        <div className="text-center py-4 text-sm text-gray-500 border-t border-gray-800">
          © {new Date().getFullYear()} Nexora Market
        </div>
      </footer>
    </div>
  );
};

export default CatalogPage;
