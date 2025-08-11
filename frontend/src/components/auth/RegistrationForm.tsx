import React, { useState } from 'react';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.text();
      alert(data);
    } catch (error) {
      alert('Registration failed');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Реєстрація</h2>

      <input
        type="text"
        name="username"
        placeholder="Ім’я користувача"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Пароль"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="USER">Користувач</option>
        <option value="SELLER">Продавець</option>
        <option value="ADMIN">Адміністратор</option>
      </select>

      <button type="submit">Зареєструватися</button>
    </form>
  );
};

export default RegisterForm;
