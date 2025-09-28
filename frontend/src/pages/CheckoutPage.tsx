import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCart, type CartItemResponseDto, clearCart } from "../api/cart";
import { createOrder } from "../api/orders";

const CheckoutPage: React.FC = () => {
  // 📌 state для форми
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [delivery, setDelivery] = useState("courier");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  const [message, setMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const [showValidation, setShowValidation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Cart items from API
  const [items, setItems] = useState<CartItemResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCart();
        setItems(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || "Не вдалося завантажити кошик");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 💰 сума
  const total = useMemo(() => items.reduce((sum, it) => sum + (it.product?.price || 0) * it.quantity, 0), [items]);

  // 📤 submit
  const handleSubmit = async () => {
    // Validate required fields; email is known, so not required here
    const missing: string[] = [];
    if (!fullName.trim()) missing.push("Повне ім'я");
    if (!phone.trim()) missing.push("Телефон");
    if (!address.trim()) missing.push("Адреса");
    if (!city.trim()) missing.push("Місто");
    if (!postalCode.trim()) missing.push("Поштовий індекс");
    if (missing.length > 0) {
      setValidationErrors(missing);
      setShowValidation(true);
      return;
    }

    try {
      setLoading(true);
      setProcessing(true);
      // Backend expects: OrderCreationDto { orderItems: [{ productId, quantity }] }
      const payload = {
        orderItems: items
          .filter((it) => Number.isFinite(Number((it.product as any)?.id)))
          .map((it) => ({
            productId: Number((it.product as any)?.id),
            quantity: it.quantity,
          })),
      };

      if (payload.orderItems.length === 0) {
        setMessage("❌ Кошик порожній або містить некоректні товари");
        return;
      }

      // Mock payment processing delay
      await new Promise((res) => setTimeout(res, 1200));
      await createOrder(payload);
      await clearCart();
      setItems([]);
      window.dispatchEvent(new CustomEvent('cart:updated'));
      setMessage("✅ Замовлення успішно оформлено!");
      // Redirect to orders after a short confirmation delay
      setTimeout(() => navigate('/orders'), 500);
    } catch (error: any) {
      setMessage("❌ Помилка оформлення: " + (error?.response?.data || error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
      setProcessing(false);
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
          placeholder="Повне ім'я"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
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
        {loading && <p>Завантаження...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <ul className="space-y-3">
          {items.map((it) => {
            const primary = it.product?.pictures?.find(p => (p as any)?.pictureType === 'PRIMARY') || it.product?.pictures?.[0];
            const imgUrl = primary?.url ? `http://localhost:8080/${primary.url}` : '/images/product/placeholder.jpg';
            return (
              <li key={it.id} className="flex items-center gap-4">
                <img
                  src={imgUrl}
                  alt={it.product?.name}
                  className="w-16 h-16 object-contain rounded-lg bg-gray-50"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{it.product?.name}</h3>
                  <p className="text-sm text-[#838383]">{it.quantity} x {it.product?.price?.toFixed(2)} грн</p>
                </div>
                <p className="font-bold">{((it.product?.price || 0) * it.quantity).toFixed(2)} грн</p>
              </li>
            );
          })}
        </ul>
        <div className="text-right font-bold mt-4">Разом: {total.toFixed(2)} грн</div>
      </div>

      {/* Кнопка */}
      <button
        onClick={handleSubmit}
        disabled={loading || processing || items.length === 0}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {processing ? 'Оплата…' : loading ? 'Оформлення…' : 'Оплатити і оформити'}
      </button>

      {message && <p className="text-center mt-4">{message}</p>}

      {/* Validation Modal */}
      {showValidation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Будь ласка, заповніть необхідні поля</h3>
            <ul className="list-disc list-inside text-sm text-[#454545] mb-4">
              {validationErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowValidation(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center">
            <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
            <div className="font-medium mb-1">Обробка оплати…</div>
            <div className="text-sm text-[#585858]">Зачекайте, будь ласка</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;