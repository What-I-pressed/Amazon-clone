import { useState, useRef, useEffect } from "react";

interface Subcategory {
  id: number;
  name: string;
}

interface CategoryDropdownProps {
  onSelect: (category: string) => void;
  onSubcategorySelect?: (subcategory: Subcategory, parentCategory: string) => void;
}

export default function CategoryDropdown({ onSelect, onSubcategorySelect }: CategoryDropdownProps) {
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
        className="px-4 flex items-center gap-2 h-10 rounded-md bg-[#757575] text-white text-sm select-none transition-all duration-300 ease-out hover:bg-[#343434] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#757575]"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="font-medium tracking-wide">{selected}</span>
        <span className="material-icons ml-1 transition-transform duration-300" style={{ lineHeight: 1, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>arrow_drop_down</span>
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-3 rounded-3xl shadow-2xl z-[9999] flex border border-[#757575]/25 animate-[fadeIn_0.18s_ease-out]"
          style={{ backgroundColor: "#FFFFFF" }}
          onMouseLeave={() => setActiveCategory(null)}
        >
          {/* Main Categories Panel */}
          <div className="w-64 border-r border-[#757575]/25 bg-white rounded-l-3xl py-2">
            <button
              className="w-full text-left px-4 py-2 text-[#343434] text-sm font-bold transition-all duration-200 hover:bg-[#343434] hover:text-white"
              onClick={() => handleSelect("All")}
            >
              All Categories
            </button>
            <div className="flex flex-col pb-1">
              {Object.keys(categories).map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    className={`w-full text-left px-4 py-2 text-[#343434] text-sm cursor-pointer flex justify-between items-center transition-all duration-200 ${isActive ? 'bg-[#757575]/15' : ''} hover:bg-[#343434] hover:text-white`}
                    onMouseEnter={() => setActiveCategory(category)}
                    onClick={() => handleSelect(category)}
                  >
                    <span className="capitalize tracking-wide">{category}</span>
                    <span className={`material-icons text-xs transition-transform duration-200 ${isActive ? 'translate-x-1' : ''}`}>chevron_right</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategories Panel */}
          <div className="w-64 px-4 py-4 bg-white rounded-r-3xl" key={activeCategory}>
            {activeCategory && categories[activeCategory] ? (
              <div className="flex flex-col gap-2">
                <div className="text-xs uppercase tracking-[0.3em] text-[#757575] pb-1">
                  {activeCategory}
                </div>
                {categories[activeCategory].map((subcategory) => (
                  <button
                    key={subcategory.id}
                    className="w-full text-left px-3 py-2 text-[#343434] text-sm rounded-lg transition-all duration-200 hover:bg-[#757575]/15 hover:translate-x-1"
                    onClick={() => {
                      handleSelect(subcategory.name);
                      if (onSubcategorySelect && activeCategory) {
                        onSubcategorySelect(subcategory, activeCategory);
                      }
                    }}
                  >
                    {subcategory.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 text-xs text-[#aaaaaa]">Hover over a category to see subcategories.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
