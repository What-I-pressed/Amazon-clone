import React, { useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

const productData: Product = {
  id: 1,
  name: "Смартфон X",
  price: 12000,
  description: "Опис товару тут. Потужний смартфон із сучасними функціями.",
};

const ProductPage: React.FC = () => {
  const [cart, setCart] = useState<Product[]>([]);

  const addToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
    alert(`${product.name} додано до кошика!`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{productData.name}</h1>
      <p className="text-gray-700 mb-4">{productData.description}</p>
      <p className="text-xl font-semibold mb-6">{productData.price} ₴</p>

      <button
        onClick={() => addToCart(productData)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Додати в кошик
      </button>

      {/**/}
      {cart.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Кошик:</h2>
          <ul className="list-disc pl-5">
            {cart.map((p, i) => (
              <li key={i}>{p.name} — {p.price} ₴</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
