import React, { useState } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

interface OrderData {
  items: CartItem[];
  address: string;
  contact: string;
  paymentMethod: string;
}

interface FormErrors {
  address?: string;
  contact?: string;
  paymentMethod?: string;
}

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([
    { id: 1, name: "Товар 1", price: 500, qty: 2 },
    { id: 2, name: "Товар 2", price: 300, qty: 1 },
    { id: 3, name: "Товар 3", price: 150, qty: 3 },
  ]);

  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCheckout, setIsCheckout] = useState(false);
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  
  const handleQtyChange = (id: number, qty: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  };

  
  const handleRemove = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // валідація 
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!address.trim()) newErrors.address = "Адреса обов'язкова";
    if (!contact.trim()) {
      newErrors.contact = "Контакт обов'язковий";
    } else if (
      !/^\+?\d{10,15}$/.test(contact) &&
      !/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(contact)
    ) {
      newErrors.contact = "Введіть коректний email або номер телефону";
    }
    if (!paymentMethod.trim())
      newErrors.paymentMethod = "Виберіть спосіб оплати";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  const handleCheckout = () => {
    if (!validate()) return;

    setLoading(true);

    const order: OrderData = { items: cart, address, contact, paymentMethod };
    // тут можна викликати бекенд
    setTimeout(() => {
      console.log("Замовлення:", order);
      alert("Замовлення успішно надіслано!");
      setCart([]); 
      setAddress("");
      setContact("");
      setPaymentMethod("");
      setIsCheckout(false);
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Кошик</h1>

      {cart.length === 0 ? (
        <p>Ваш кошик порожній</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                borderBottom: "1px solid #ccc",
                paddingBottom: "10px",
              }}
            >
              <div>
                <p>{item.name}</p>
                <p>{item.price} грн</p>
              </div>
              <div>
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) =>
                    handleQtyChange(item.id, parseInt(e.target.value))
                  }
                  style={{ width: "60px" }}
                />
                <button
                  onClick={() => handleRemove(item.id)}
                  style={{ marginLeft: "10px" }}
                >
                  Видалити
                </button>
              </div>
            </div>
          ))}

          <h2>Загальна сума: {total} грн</h2>

          {!isCheckout ? (
            <button onClick={() => setIsCheckout(true)}>
              Оформити замовлення
            </button>
          ) : (
            <div style={{ marginTop: "20px" }}>
              <h3>Оформлення замовлення</h3>
              <div>
                <label>Адреса:</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {errors.address && (
                  <p style={{ color: "red" }}>{errors.address}</p>
                )}
              </div>
              <div>
                <label>Контакт (email або телефон):</label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
                {errors.contact && (
                  <p style={{ color: "red" }}>{errors.contact}</p>
                )}
              </div>
              <div>
                <label>Спосіб оплати:</label>
                <input
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                {errors.paymentMethod && (
                  <p style={{ color: "red" }}>{errors.paymentMethod}</p>
                )}
              </div>
              <button onClick={handleCheckout} disabled={loading}>
                {loading ? "Відправка..." : "Підтвердити замовлення"}
              </button>
              <button
                onClick={() => setIsCheckout(false)}
                style={{ marginLeft: "10px" }}
              >
                Скасувати
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPage;
