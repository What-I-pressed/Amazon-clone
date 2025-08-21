import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
  sold: number;
  rating?: number;
}

type SellerStats = {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
};

type Seller = {
  id: string;
  email: string;
  avatar: string;
  rating: number;
  stats: SellerStats;
  name: string;
  description?: string;
};

const SellerProfileView = () => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fakeSeller: Seller = {
      id: "test-id",
      email: "seller@example.com",
      avatar: "https://m.media-amazon.com/images/S/sash/MzMwWD6VTDRGHD8.png",
      rating: 4.7,
      stats: {
        totalOrders: 150,
        completedOrders: 140,
        cancelledOrders: 5,
      },
      name: "Best Electronics Store",
      description:
        "Your trusted seller for high-quality electronics, fast shipping, and excellent customer service.",
    };

    const fakeProducts: Product[] = Array.from({ length: 8 }, (_, i) => ({
      id: String(i + 1),
      name: `Product ${i + 1}`,
      description: `Description for product ${i + 1}`,
      price: 99.99,
      images: [""], // пусто → заглушка
      createdAt: "2025-08-01",
      updatedAt: "2025-08-10",
      views: 100,
      sold: 50,
      rating: 4.3,
    }));

    setTimeout(() => {
      setSeller(fakeSeller);
      setProducts(fakeProducts);
      setLoading(false);
    }, 400);
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600 animate-pulse">
        Завантаження профілю...
      </div>
    );

  if (!seller)
    return (
      <div className="text-gray-500 text-center mt-4">Профіль не знайдено</div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Banner */}
      <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-700">
          {seller.name}
        </h1>
      </div>

      <div className="p-6 md:p-12 space-y-12">
        {/* Profile Header */}
        <div className="bg-white shadow-sm border rounded-lg p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={seller.avatar}
            alt="Seller Avatar"
            className="w-20 h-20 rounded-full border border-gray-300"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{seller.name}</h2>
            <p className="text-sm text-gray-500">{seller.email}</p>
            <div className="mt-2 flex items-center">
              <span className="text-yellow-500 mr-1 text-lg">★</span>
              <span className="text-gray-700 font-medium">{seller.rating}</span>
            </div>
            {seller.description && (
              <p className="mt-4 text-gray-700">{seller.description}</p>
            )}
          </div>
        </div>

        {/* Statistics */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Статистика</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Всього замовлень", value: seller.stats.totalOrders },
              { label: "Виконані", value: seller.stats.completedOrders },
              { label: "Скасовані", value: seller.stats.cancelledOrders },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white border rounded-lg p-6 text-center hover:shadow transition"
              >
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Products styled like your screenshot */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Товари продавця
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="relative bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-end"
              >
                {/* Заглушка под картинку */}
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Image</span>
                </div>
                <div className="p-4">
                  <h3 className="text-md font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">{product.description}</p>
                  <div className="mt-2 text-lg font-bold text-amazon-blue">
                    ${product.price.toFixed(2)}
                  </div>
                  <div className="mt-1 flex items-center text-yellow-500">
                    {"★".repeat(Math.floor(product.rating || 0))}
                    {"☆".repeat(5 - Math.floor(product.rating || 0))}
                    <span className="text-gray-600 text-sm ml-2">
                      {product.rating?.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Продано: {product.sold}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// Tailwind config addition for Amazon style
// theme: {
//   extend: {
//     colors: {
//       'amazon-blue': '#146eb4',
//       'amazon-blue-dark': '#0f4a7b',
//     }
//   }
// }

export default SellerProfileView;
