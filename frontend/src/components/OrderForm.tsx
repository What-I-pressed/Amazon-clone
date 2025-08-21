import React, { useState } from "react";
import Button from "./ui/Button";

export default function OrderForm() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, address, phone });
    alert("Замовлення оформлено! (в консолі)");
    setName(""); setAddress(""); setPhone("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 bg-white rounded shadow">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Ім’я" className="w-full p-2 border rounded"/>
      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Адреса" className="w-full p-2 border rounded"/>
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Телефон" className="w-full p-2 border rounded"/>
      <Button type="submit">Підтвердити замовлення</Button>
    </form>
  );
}
