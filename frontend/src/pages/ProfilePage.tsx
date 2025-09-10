
import React, { useState } from "react";

interface User {
  name: string;
  email: string;
  phone?: string;
}

const ProfilePage: React.FC = () => {
  // дані користувача (можна підвантажити з бекенду)
  const [user, setUser] = useState<User>({
    name: "Даша Росс",
    email: "dasha@example.com",
    phone: "0671234567",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // тут можна відправити на бекенд
    console.log("Збережено користувача:", user);
    setIsEditing(false);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h1>Профіль користувача</h1>
      {!isEditing ? (
        <div>
          <p><strong>Ім'я:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Телефон:</strong> {user.phone}</p>
          <button onClick={() => setIsEditing(true)}>Редагувати</button>
        </div>
      ) : (
        <div>
          <div>
            <label>Ім'я:</label>
            <input name="name" value={user.name} onChange={handleChange} />
          </div>
          <div>
            <label>Email:</label>
            <input name="email" value={user.email} onChange={handleChange} />
          </div>
          <div>
            <label>Телефон:</label>
            <input name="phone" value={user.phone} onChange={handleChange} />
          </div>
          <button onClick={handleSave}>Зберегти</button>
          <button onClick={() => setIsEditing(false)}>Скасувати</button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

