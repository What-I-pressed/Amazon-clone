import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const RegisterForm = () => {
  const { loginUser } = useContext(AuthContext)!;

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/auth/register/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Помилка реєстрації");
      }

      const data = await res.json(); // очікуємо { token: '...' }
      await loginUser(data); // передаем токен в контекст
      window.location.href = "/dashboard"; // редирект після реєстрації
    } catch (err: any) {
      alert(err.message || "Помилка при реєстрації");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Реєстрація</h2>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="username"
        placeholder="Нікнейм"
        value={form.username}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Пароль"
        value={form.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Зареєструватися</button>
    </form>
  );
};

export default RegisterForm;
