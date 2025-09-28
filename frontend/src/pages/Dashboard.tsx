import { isLoggedIn } from "../utilites/auth";
import LogoutButton from "../components/Login/LogoutButton";
import React from "react";

const Dashboard: React.FC = () => {
  if (!isLoggedIn()) {
    window.location.href = "/login";
    return null;
  }

  const user = getUser(); 

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Вітаємо, {user?.name || "користувач"}!</h1>

      {/* Блок профілю */}
      <div className="bg-white shadow rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Профіль</h2>
        <p><span className="font-semibold">Ім’я:</span> {user?.name}</p>
        <p><span className="font-semibold">Email:</span> {user?.email}</p>
      </div>

      {/* Блок замовлень */}
      <div className="bg-white shadow rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Мої замовлення</h2>
        <ul className="space-y-2">
          <li className="p-3 border rounded-lg flex justify-between">
            <span>Замовлення #1234</span>
            <span className="text-green-600 font-semibold">Доставлено</span>
          </li>
          <li className="p-3 border rounded-lg flex justify-between">
            <span>Замовлення #1235</span>
            <span className="text-yellow-600 font-semibold">В обробці</span>
          </li>
        </ul>
      </div>

      {/* Блок налаштувань */}
      <div className="bg-white shadow rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Налаштування акаунту</h2>
        <button className="bg-[#e7e7e7] px-4 py-2 rounded-lg mr-2">Змінити пароль</button>
        <button className="bg-[#e7e7e7] px-4 py-2 rounded-lg">Редагувати профіль</button>
      </div>

      {/* Кнопка виходу */}
      <LogoutButton />
    </div>
  );
};

export default Dashboard;
