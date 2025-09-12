import { useState } from "react";
import ProductCard from './ProductCard';

const recommended = [
  { id: 1, name: "Смартфон X", category: "Гаджети", price: 12000, image: "/images/phone.jpg" },
  { id: 2, name: "Навушники Y", category: "Аксесуари", price: 2500, image: "/images/headphones.jpg" },
];

const newArrivals = [
  { id: 3, name: "Ноутбук Z", category: "Гаджети", price: 35000, image: "/images/laptop.jpg" },
];

const discounts = [
  { id: 4, name: "Смарт-годинник", category: "Аксесуари", price: 4000, discount: 20, image: "/images/watch.jpg" },
];

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Всі");
  const [sort, setSort] = useState("новинки");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const allProducts = [...recommended, ...newArrivals, ...discounts];

  // за пошуком і категорією
  let filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (categoryFilter === "Всі" || p.category === categoryFilter)
  );

  // Сортування
  if (sort === "ціна_зростання") filtered.sort((a,b)=>a.price-b.price);
  if (sort === "ціна_спадання") filtered.sort((a,b)=>b.price-a.price);

  // Пагінація
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayed = filtered.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  // Функція для фільтрування по секціях
  const getSectionProducts = (sectionArray: typeof allProducts) => {
    return displayed.filter(p => sectionArray.find(s => s.id === p.id));
  }

  return (
    <div className="p-6 space-y-12">

      {/* Пошук, фільтри та сортування */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Пошук товару..." 
          value={search} 
          onChange={e=>setSearch(e.target.value)}
          className="border rounded-xl p-2 w-full md:w-1/3"
        />
        <select className="border rounded-xl p-2" value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="новинки">Новинки</option>
          <option value="ціна_зростання">Ціна ↑</option>
          <option value="ціна_спадання">Ціна ↓</option>
        </select>
        <select className="border rounded-xl p-2" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}>
          <option>Всі</option>
          <option>Гаджети</option>
          <option>Аксесуари</option>
        </select>
      </div>

      {/* Рекомендовані */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Рекомендовані</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {getSectionProducts(recommended).map((p)=><ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Новинки */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Новинки</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {getSectionProducts(newArrivals).map((p)=><ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Знижки */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Знижки</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {getSectionProducts(discounts).map((p)=><ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Пагінація */}
      <div className="flex justify-center gap-2 mt-6">
        {[...Array(totalPages)].map((_,i)=>(
          <button
            key={i}
            className={`px-4 py-2 rounded-xl border ${currentPage===i+1 ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
            onClick={()=>setCurrentPage(i+1)}
          >
            {i+1}
          </button>
        ))}
      </div>

    </div>
  );
}
