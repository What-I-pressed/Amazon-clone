import React, { useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "../../components/ui/button/Button";
import { uploadProductPicture } from "../../api/pictures";

const UploadProductPictures: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const onUpload = async () => {
    if (!productId || !Number.isFinite(productId)) {
      setError("Невірний ID продукту");
      return;
    }
    if (!files || files.length === 0) {
      setError("Оберіть хоча б один файл");
      return;
    }
    setError(null);
    setUploading(true);
    const msgs: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const res = await uploadProductPicture(productId, file);
          msgs.push(`${file.name}: ${res}`);
        } catch (err: any) {
          msgs.push(`${file.name}: ${err?.response?.data || err?.message || 'Помилка завантаження'}`);
        }
      }
      setMessages(msgs);
    } finally {
      setUploading(false);
    }
  };

  const gotoProduct = () => {
    // If you have a product page by slug/ID, adjust the path accordingly
    navigate(`/product/${productId}`);
  };

  const previews = useMemo(() => files.map((f) => ({
    name: f.name,
    size: f.size,
    url: URL.createObjectURL(f),
  })), [files]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Завантаження зображень для продукту #{productId}</h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={gotoProduct}>Переглянути продукт</Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div
        className="bg-white p-6 rounded-xl border border-dashed border-gray-300 text-center hover:border-brand-500 transition"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <div className="mx-auto flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 7.5 12 3m0 0L7.5 7.5M12 3v13.5" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Перетягніть зображення сюди</p>
            <p className="text-sm text-gray-500">або</p>
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white cursor-pointer hover:bg-gray-800">
            <input className="hidden" type="file" accept="image/*" multiple onChange={onFileChange} />
            Обрати файли
          </label>
          <p className="text-xs text-gray-500">Підтримуються JPG, PNG, WEBP. До 10 МБ кожне</p>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Попередній перегляд ({previews.length})</h2>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setFiles([])}>Очистити</Button>
              <Button type="button" onClick={onUpload} disabled={uploading}>
                {uploading ? "Завантаження..." : "Завантажити всі"}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((p, idx) => (
              <div key={idx} className="group relative rounded-lg border bg-white overflow-hidden">
                <img src={p.url} alt={p.name} className="aspect-square object-cover w-full" />
                <div className="p-2 text-xs text-gray-700 truncate">{p.name}</div>
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1 shadow"
                  title="Видалити"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="mt-6 rounded-xl border bg-green-50 border-green-200 p-4">
          <h3 className="font-semibold text-green-800 mb-2">Результат</h3>
          <ul className="space-y-1 text-sm text-green-900 list-disc pl-5">
            {messages.map((m, idx) => (
              <li key={idx}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadProductPictures;
