import React, { useState } from "react";
import axios from "axios";

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  image: string;
}

const CheckoutPage: React.FC = () => {
  // 🛒 тимчасові дані (можна замінити на CartContext або Redux)
  const [cart] = useState<CartItem[]>([
    { id: 1, name: "Ноутбук Acer Aspire 5", price: 18999, qty: 1, image: "/banner.png" },
    { id: 2, name: "Навушники Sony WH-1000XM5", price: 12999, qty: 2, image: "/banner.png" },
  ]);

  // 📌 state для форми
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [delivery, setDelivery] = useState("courier");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  const [message, setMessage] = useState<string | null>(null);

  // 💰 сума
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // 📤 submit
  const handleSubmit = async () => {
    if (!address || !fullName || !phone || !email) {
      alert("Будь ласка, заповніть усі поля");
      return;
    }

    const order = {
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.qty,
      })),
      shippingInfo: {
        fullName,
        email,
        phone,
        address,
        city,
        postalCode,
      },
      paymentMethod,
      totalPrice: total,
    };

    try {
      await axios.post("http://localhost:8080/api/orders", order);
      setMessage("✅ Замовлення успішно оформлено!");
    } catch (error: any) {
      setMessage("❌ Помилка оформлення: " + (error.response?.data || error.message));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Оформлення замовлення</h1>

      {/* Контакти */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Контактні дані</h2>
        <input
          type="text"
          placeholder="Повне ім’я"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border rounded-lg p-2 mb-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-2 mb-2"
        />
        <input
          type="tel"
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* Адреса */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Адреса доставки</h2>
        <input
          type="text"
          placeholder="Адреса"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded-lg p-2 mb-2"
        />
        <input
          type="text"
          placeholder="Місто"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border rounded-lg p-2 mb-2"
        />
        <input
          type="text"
          placeholder="Поштовий індекс"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
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

      {/* Оплата */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Метод оплати</h2>
        <label className="block">
          <input
            type="radio"
            name="payment"
            value="Credit Card"
            checked={paymentMethod === "Credit Card"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />{" "}
          Банківська картка
        </label>
        <label className="block">
          <input
            type="radio"
            name="payment"
            value="PayPal"
            checked={paymentMethod === "PayPal"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />{" "}
          PayPal
        </label>
        <label className="block">
          <input
            type="radio"
            name="payment"
            value="Cash on Delivery"
            checked={paymentMethod === "Cash on Delivery"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />{" "}
          Післяплата
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

      {message && <p className="text-center mt-4">{message}</p>}
    </div>
  );
};

export default CheckoutPage;
