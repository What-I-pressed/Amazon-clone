import React, { useState } from "react";
import Button from "./ui/Button";

export default function CreateAdForm() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, price, description });
    alert("Оголошення створено! (в консолі)");
    setTitle(""); setPrice(""); setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 bg-white rounded shadow">
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Назва товару" className="w-full p-2 border rounded"/>
      <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Ціна" type="number" className="w-full p-2 border rounded"/>
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Опис" className="w-full p-2 border rounded"/>
      <Button type="submit">Опублікувати</Button>
    </form>
  );
}
