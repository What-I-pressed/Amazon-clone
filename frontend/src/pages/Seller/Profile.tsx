import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom"; // временно отключаем
import type { Seller } from "../../types/seller";
import { 
  // fetchSellerProfile, 
  updateSellerProfile 
} from "../../api/seller";

const SellerProfile = () => {
    // const { id: sellerId } = useParams<{ id: string | undefined }>(); // временно отключаем

    // Задаём тестового продавца сразу, чтобы не ждать загрузки
    const [seller, setSeller] = useState<Seller | null>({
        id: "test-id",
        email: "test@example.com",
        avatar: "",
        rating: 0,
        stats: {
          productsCount: 0,
          ordersCount: 0,
          totalViews: 0,
        },
        name: "Тестовий продавець",
        description: "Опис продавця для тесту",
      });
    const [loading, setLoading] = useState(false); // загрузка не нужна
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState(seller?.name || "");
    const [description, setDescription] = useState(seller?.description || "");

    /*
    useEffect(() => {
        if (!sellerId) {
            setLoading(false);
            setError("Ідентифікатор продавця не вказано");
            return;
        }

        async function loadSeller() {
            try {
                setLoading(true);
                const data = await fetchSellerProfile(sellerId);
                setSeller(data);
                setName(data.name || "");
                setDescription(data.description || "");
            } catch (e) {
                setError(e instanceof Error ? e.message : "Щось пішло не так");
            } finally {
                setLoading(false);
            }
        }
        loadSeller();
    }, [sellerId]);
    */

    async function handleSave() {
        /*
        if (!sellerId) {
            setError("Ідентифікатор продавця відсутній для збереження");
            return;
        }
        */
        try {
            setError(null);
            if (!seller) {
                setError("Немає даних про продавця для оновлення.");
                return;
            }
            // тут можешь не вызывать updateSellerProfile, а просто имитировать
            // const updated = await updateSellerProfile(sellerId, { name, description });
            // setSeller(updated);

            // Для теста просто обновим локальный стейт
            setSeller({ ...seller, name, description });

            alert("Профіль оновлено!");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Помилка оновлення");
        }
    }

    // проверка загрузки — её нет, просто пропускаем
    if (loading) {
        return <div>Завантаження профілю...</div>;
    }

    if (error) {
        return <div style={{ color: "red" }}>Помилка: {error}</div>;
    }

    /*
    if (!sellerId) {
        return <div>Ідентифікатор продавця не вказано</div>;
    }
    */

    if (!seller) {
        return <div>Профіль не знайдено</div>;
    }

    return (
        <div>
            <h1>Профіль продавця (тест)</h1>
            <label>
                Ім'я:
                <input value={name} onChange={e => setName(e.target.value)} />
            </label>
            <br />
            <label>
                Опис:
                <textarea value={description} onChange={e => setDescription(e.target.value)} />
            </label>
            <br />
            <button onClick={handleSave}>Зберегти</button>
        </div>
    );
};

export default SellerProfile;
