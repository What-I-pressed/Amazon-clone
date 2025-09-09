import React, { useState } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  image: string;
}

const CheckoutPage: React.FC = () => {
  // Тимчасові дані
  const [cart] = useState<CartItem[]>([
    { id: 1, name: "Ноутбук Acer Aspire 5", price: 18999, qty: 1, image: "/banner.png" },
    { id: 2, name: "Навушники Sony WH-1000XM5", price: 12999, qty: 2, image: "/banner.png" },
  ]);

  const [address, setAddress] = useState("");
  const [delivery, setDelivery] = useState("courier");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSubmit = () => {
    if (!address) {
      alert("Будь ласка, введіть адресу доставки");
      return;
    }
    alert(`Замовлення оформлено!\nАдреса: ${address}\nДоставка: ${delivery}\nСума: ${total}₴`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Оформлення замовлення</h1>

      {/* Адреса */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Адреса доставки</h2>
        <input
          type="text"
          placeholder="Введіть адресу"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* Спосіб доставки */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Спосіб доставки</h2>
        <label className="block">
          <input
            type="radio"
            value="courier"
            checked={delivery === "courier"}
            onChange={(e) => setDelivery(e.target.value)}
          />{" "}
          Кур'єр (100₴)
        </label>
        <label className="block">
          <input
            type="radio"
            value="pickup"
            checked={delivery === "pickup"}
            onChange={(e) => setDelivery(e.target.value)}
          />{" "}
          Самовивіз (безкоштовно)
        </label>
      </div>

      {/* Огляд замовлення */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4">Ваше замовлення</h2>
        <ul className="space-y-3">
          {cart.map((item) => (
            <li key={item.id} className="flex items-center gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  {item.qty} x {item.price}₴
                </p>
              </div>
              <p className="font-bold">{item.price * item.qty}₴</p>
            </li>
          ))}
        </ul>
        <div className="text-right font-bold mt-4">Разом: {total}₴</div>
      </div>

      {/* Кнопка */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
      >
        Підтвердити замовлення
      </button>
    </div>
  );
};

export default CheckoutPage;
