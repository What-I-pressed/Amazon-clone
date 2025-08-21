import { useState } from "react";
import ProductCard from './ProductCard';

const purchases = [
  { 
    image: "/images/phone.jpg",
    title: "Смартфон X",
    price: 1200,
    rating: 4.5,
    description: "Новий потужний смартфон X",
  },
];

const subscriptions = [
  { 
    image: "/images/music.jpg",
    title: "Музичний сервіс Premium",
    price: 10,
    rating: 4,
    description: "Безлімітна музика на місяць",
  },
];

const favorites = [
  { 
    image: "/images/headphones.jpg",
    title: "Навушники Y",
    price: 250,
    rating: 4.8,
    description: "Якісні бездротові навушники",
  },
];

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<"purchases" | "subscriptions" | "favorites">("purchases");

  const items = {
    purchases: purchases,
    subscriptions: subscriptions,
    favorites: favorites
  };

  return (
    <div className="p-6 space-y-6">
      {/* Вкладки */}
      <div className="flex gap-4 mb-4">
        {["purchases", "subscriptions", "favorites"].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab === "purchases" ? "Покупки" : tab === "subscriptions" ? "Підписки" : "Улюблені"}
          </button>
        ))}
      </div>

      {/* Контент активної вкладки */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items[activeTab].map((item, i) => (
          <ProductCard
            key={i}
            image={item.image}
            title={item.title}
            price={item.price}
            rating={item.rating}
            description={item.description}
            onAddToCart={() => console.log("Added to cart:", item.title)}
          />
        ))}
      </div>
    </div>
  );
}
