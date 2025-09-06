import React from "react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  discount?: number;
  image: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-4 flex flex-col items-center hover:shadow-lg transition">
      <img
        src={product.image}
        alt={product.name}
        className="w-32 h-32 object-cover mb-4 rounded-xl"
      />
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-500">{product.category}</p>
      <p className="text-red-500 font-bold mt-2">{product.price} ₴</p>
      {product.discount && (
        <span className="text-green-500 font-semibold">
          -{product.discount}%
        </span>
      )}
    </div>
  );
}
