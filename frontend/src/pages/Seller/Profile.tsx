import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Seller } from "../../types/seller";
import { fetchSellerProfile, updateSellerProfile } from "../../api/seller";

const SellerProfile = () => {
    const { id: sellerId } = useParams<{ id: string | undefined }>();

    const [seller, setSeller] = useState<Seller | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

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

    async function handleSave() {
        if (!sellerId) {
            setError("Ідентифікатор продавця відсутній для збереження");
            return;
        }
        try {
            setError(null);
            if (!seller) {
                setError("Немає даних про продавця для оновлення.");
                return;
            }
            const updated = await updateSellerProfile(sellerId, { name, description });
            setSeller(updated);
            alert("Профіль оновлено!");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Помилка оновлення");
        }
    }
// перевірки
    if (loading) {
        return <div>Завантаження профілю...</div>;
    }

    if (error) {
        return <div style={{ color: "red" }}>Помилка: {error}</div>;
    }

    if (!sellerId) {
        return <div>Ідентифікатор продавця не вказано</div>;
    }

    if (!seller) {
        return <div>Профіль не знайдено</div>;
    }

    return (
        <div>
            <h1>Профіль продавця</h1>
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