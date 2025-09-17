import { useState, useRef, useEffect } from "react";

interface Subcategory {
  id: number;
  name: string;
}

interface CategoryDropdownProps {
  onSelect: (category: string) => void;
}

export default function CategoryDropdown({ onSelect }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("All");
  const [categories, setCategories] = useState<Record<string, Subcategory[]>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/characteristics/categories/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (category: string) => {
    setSelected(category);
    onSelect(category);
    setIsOpen(false);
    setActiveCategory(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="px-3 flex rounded-md items-center h-10 bg-[#757575] text-white text-sm select-none transition-colors duration-300 ease-in-out hover:bg-[#343434] focus:outline-none"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span>{selected}</span>
        <span className="material-icons ml-1" style={{ lineHeight: 1 }}>arrow_drop_down</span>
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 rounded-md shadow-lg z-[9999] overflow-hidden flex"
          style={{ backgroundColor: "#757575" }}
          onMouseLeave={() => setActiveCategory(null)}
        >
          {/* Main Categories Panel */}
          <div className="w-48 border-r border-[#343434]">
            <button
              className="w-full text-left px-3 py-2 hover:bg-[#343434] text-white text-sm block font-bold"
              onClick={() => handleSelect("All")}
            >
              All Categories
            </button>
            {Object.keys(categories).map((category) => (
              <div
                key={category}
                className="w-full text-left px-3 py-2 hover:bg-[#343434] text-white text-sm cursor-pointer flex justify-between items-center"
                onMouseEnter={() => setActiveCategory(category)}
              >
                <span>{category}</span>
                <span className="material-icons text-xs">chevron_right</span>
              </div>
            ))}
          </div>

          {/* Subcategories Panel */}
          <div className="w-48" key={activeCategory}>
            {activeCategory && categories[activeCategory] ? (
              categories[activeCategory].map((subcategory) => (
                <button
                  key={subcategory.id}
                  className="w-full text-left px-3 py-2 hover:bg-[#343434] text-white text-sm block"
                  onClick={() => handleSelect(subcategory.name)}
                >
                  {subcategory.name}
                </button>
              ))
            ) : (
              <div className="p-3 text-xs text-[#aaaaaa]">Hover over a category to see subcategories.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
