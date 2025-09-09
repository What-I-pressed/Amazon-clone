import React from "react";
import ProductCard from "./ProductCard";

const CatalogPage: React.FC = () => {
  const products = [
    {
      id: 1,
      name: "Ноутбук Acer Aspire 5",
      category: "Ноутбуки",
      price: 18999,
      discount: 10,
      image: "/banner.png",
    },
    {
      id: 2,
      name: "Смартфон Samsung Galaxy S23",
      category: "Смартфони",
      price: 32999,
      image: "/banner.png",
    },
    {
      id: 3,
      name: "Навушники Sony WH-1000XM5",
      category: "Аудіо",
      price: 12999,
      discount: 5,
      image: "/banner.png",
    },
    {
      id: 4,
      name: "Телевізор LG OLED55",
      category: "Телевізори",
      price: 44999,
      image: "/banner.png",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Каталог товарів</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default CatalogPage;
