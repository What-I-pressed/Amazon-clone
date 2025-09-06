import React from "react";
import BannerSlider from "../../components/BannerSlider";
import ProductCard from "../ProductCard";

const HomePage: React.FC = () => {
  const featuredProducts = [
    { id: 1, name: "Ноутбук Acer Aspire 5", category: "Ноутбуки", price: 18999, image: "/banner.png" },
    { id: 2, name: "Смартфон Samsung Galaxy S23", category: "Смартфони", price: 32999, image: "/banner.png" },
    { id: 3, name: "Навушники Sony WH-1000XM5", category: "Аудіо", price: 12999, image: "/banner.png" },
  ];

  const categories = [
    { id: 1, name: "Ноутбуки", image: "/banner.png" },
    { id: 2, name: "Смартфони", image: "/banner.png" },
    { id: 3, name: "Телевізори", image: "/banner.png" },
    { id: 4, name: "Аудіо", image: "/banner.png" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Хедер */}
      <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <h1 className="text-2xl font-bold">Amazon Clone</h1>
      </header>

      {/* Банер */}
      <section className="my-6 px-6">
        <BannerSlider />
      </section>

      {/* Привітання */}
      <section className="text-center py-6">
        <h2 className="text-xl font-semibold">Ласкаво просимо до нашого магазину!</h2>
        <p className="text-gray-600 mt-2">
          Знаходь найкращі товари за супер цінами.
        </p>
      </section>

      {/* Категорії */}
      <section className="px-6 py-8">
        <h2 className="text-lg font-bold mb-4">Популярні категорії</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white shadow rounded-xl p-4 flex flex-col items-center hover:shadow-lg transition cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-24 h-24 object-cover mb-2 rounded-lg"
              />
              <p className="font-medium">{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Рекомендовані товари */}
      <section className="px-6 py-8 bg-white shadow-inner">
        <h2 className="text-lg font-bold mb-4">Рекомендовані товари</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-gray-800 text-gray-200 text-center py-4 mt-8">
        © {new Date().getFullYear()} Amazon Clone. Всі права захищені.
      </footer>
    </div>
  );
};

export default HomePage;

